from typing import Any, Callable, Generic, List, Optional, Type, TypeVar

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.schemas.shared.base import (
    APIResponse,
    BulkOperationRequest,
    FilterRequest,
    PaginationRequest,
    PaginationResponse,
    SearchRequest,
    SearchResponse,
)
from app.repositories.interfaces.base import BaseRepository, RepositoryError

from app.api.v1.shared.utils import apply_patch, filter_items

TModel = TypeVar("TModel")
TCreate = TypeVar("TCreate", bound=BaseModel)
TUpdate = TypeVar("TUpdate", bound=BaseModel)
TDetail = TypeVar("TDetail", bound=BaseModel)
TList = TypeVar("TList", bound=BaseModel)


def build_crud_router(
    prefix: str,
    tags: list[str],
    repository_dependency: Callable[..., BaseRepository[Any]],
    service_dependency: Callable[..., Any],
    model_class: type[TModel],
    create_schema: type[TCreate],
    update_schema: type[TUpdate],
    detail_schema: type[TDetail],
    list_schema: type[TList],
    bulk_update_schema: type[BaseModel],
    extra_routes: Optional[Callable[[APIRouter], None]] = None,
    entity_name: Optional[str] = None,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=tags)
    entity_label = entity_name or tags[0].rstrip("s")
    if not entity_label:
        entity_label = tags[0]

    @router.get(
        "/",
        response_model=APIResponse[PaginationResponse[list_schema]],
        summary=f"List {tags[0]}",
        description=f"Retrieve a paginated list of {tags[0]} records.",
    )
    async def list_entities(
        pagination: PaginationRequest = Depends(),
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        items, total = await repository.paginate(pagination.page, pagination.page_size)
        response = PaginationResponse[list_schema](
            items=[list_schema.model_validate(item) for item in items],
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            pages=(total + pagination.page_size - 1) // pagination.page_size,
        )
        return APIResponse(data=response)

    @router.post(
        "/",
        response_model=APIResponse[detail_schema],
        status_code=status.HTTP_201_CREATED,
        summary=f"Create {entity_label}",
        description=f"Create a new {entity_label} record.",
    )
    async def create_entity(
        payload: Any,
        repository: BaseRepository[Any] = Depends(repository_dependency),
        service: Any = Depends(service_dependency),
    ):
        payload_data = payload.model_dump()
        if hasattr(service, "enroll_student"):
            await service.enroll_student(**payload_data)
        elif hasattr(service, "create_application"):
            await service.create_application(**payload_data)
        elif hasattr(service, "join_employee"):
            await service.join_employee(**payload_data)
        elif hasattr(service, "create_invoice"):
            await service.create_invoice(**payload_data)
        elif hasattr(service, "post_entry"):
            await service.post_entry(**payload_data)
        elif hasattr(service, "allocate_room"):
            await service.allocate_room(**payload_data)
        elif hasattr(service, "validate_stock"):
            await service.validate_stock(**payload_data)
        elif hasattr(service, "issue_book"):
            await service.issue_book(**payload_data)
        elif hasattr(service, "dispatch"):
            await service.dispatch(**payload_data)
        elif hasattr(service, "create_request"):
            await service.create_request(**payload_data)
        elif hasattr(service, "allocate_vehicle"):
            await service.allocate_vehicle(**payload_data)

        entity = model_class(**payload_data)
        created = await repository.create(entity)
        return APIResponse(data=detail_schema.model_validate(created), message="Created")

    create_entity.__annotations__["payload"] = create_schema

    @router.get(
        "/{entity_id}",
        response_model=APIResponse[detail_schema],
        summary=f"Get {entity_label}",
        description=f"Retrieve a single {entity_label} by ID.",
    )
    async def get_entity(
        entity_id: int,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        entity = await repository.get_by_id(entity_id)
        if entity is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        return APIResponse(data=detail_schema.model_validate(entity))

    @router.put(
        "/{entity_id}",
        response_model=APIResponse[detail_schema],
        summary=f"Replace {entity_label}",
        description=f"Replace a {entity_label} record by ID.",
    )
    async def replace_entity(
        entity_id: int,
        payload: Any,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        existing = await repository.get_by_id(entity_id)
        if existing is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        update_data = payload.model_dump()
        apply_patch(existing, update_data)
        await repository._commit()
        await repository._refresh(existing)
        return APIResponse(data=detail_schema.model_validate(existing), message="Updated")

    replace_entity.__annotations__["payload"] = update_schema

    @router.patch(
        "/{entity_id}",
        response_model=APIResponse[detail_schema],
        summary=f"Update {entity_label}",
        description=f"Update one or more fields for a {entity_label}.",
    )
    async def patch_entity(
        entity_id: int,
        payload: Any,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        existing = await repository.get_by_id(entity_id)
        if existing is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        update_data = payload.model_dump(exclude_unset=True)
        apply_patch(existing, update_data)
        await repository._commit()
        await repository._refresh(existing)
        return APIResponse(data=detail_schema.model_validate(existing), message="Updated")

    patch_entity.__annotations__["payload"] = update_schema

    @router.delete(
        "/{entity_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        summary=f"Delete {entity_label}",
        description=f"Delete a {entity_label} record by ID.",
    )
    async def delete_entity(
        entity_id: int,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        deleted = await repository.delete(entity_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        return

    @router.post(
        "/search",
        response_model=APIResponse[SearchResponse[list_schema]],
        summary=f"Search {tags[0]}",
        description=f"Search {tags[0]} records by text query.",
    )
    async def search_entities(
        payload: SearchRequest,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        results = await repository.search(payload.query)
        response = SearchResponse[list_schema](
            items=[list_schema.model_validate(item) for item in results],
            total=len(results),
        )
        return APIResponse(data=response)

    @router.post(
        "/filter",
        response_model=APIResponse[PaginationResponse[list_schema]],
        summary=f"Filter {tags[0]}",
        description=f"Filter {tags[0]} records by a field condition.",
    )
    async def filter_entities(
        payload: FilterRequest,
        pagination: PaginationRequest = Depends(),
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        all_items = await repository.get_all()
        filtered = filter_items(all_items, payload)
        start = (pagination.page - 1) * pagination.page_size
        end = start + pagination.page_size
        response = PaginationResponse[list_schema](
            items=[list_schema.model_validate(item) for item in filtered[start:end]],
            total=len(filtered),
            page=pagination.page,
            page_size=pagination.page_size,
            pages=(len(filtered) + pagination.page_size - 1) // pagination.page_size,
        )
        return APIResponse(data=response)

    @router.post(
        "/bulk",
        response_model=APIResponse[list[list_schema]],
        summary=f"Bulk create {tags[0]}",
        description=f"Create multiple {tags[0]} records in bulk.",
    )
    async def bulk_create_entities(
        payload: Any,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        entities = [model_class(**item.model_dump()) for item in payload]
        created = await repository.bulk_create(entities)
        return APIResponse(data=[list_schema.model_validate(item) for item in created], message="Bulk created")

    bulk_create_entities.__annotations__["payload"] = list[create_schema]

    @router.patch(
        "/bulk",
        response_model=APIResponse[list[list_schema]],
        summary=f"Bulk update {tags[0]}",
        description=f"Update multiple {tags[0]} records in bulk.",
    )
    async def bulk_update_entities(
        payload: Any,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        updated_entities: list[Any] = []
        for item in payload:
            existing = await repository.get_by_id(item.id)
            if existing is None:
                continue
            update_data = item.model_dump(exclude_unset=True)
            update_data.pop("id", None)
            apply_patch(existing, update_data)
            updated_entities.append(existing)
        await repository._commit()
        for entity in updated_entities:
            await repository._refresh(entity)
        return APIResponse(data=[list_schema.model_validate(item) for item in updated_entities], message="Bulk updated")

    bulk_update_entities.__annotations__["payload"] = list[bulk_update_schema]

    @router.delete(
        "/bulk",
        response_model=APIResponse[dict[str, int]],
        summary=f"Bulk delete {tags[0]}",
        description=f"Delete multiple {tags[0]} records in bulk.",
    )
    async def bulk_delete_entities(
        payload: BulkOperationRequest,
        repository: BaseRepository[Any] = Depends(repository_dependency),
    ):
        deleted_count = await repository.bulk_delete(payload.ids)
        return APIResponse(data={"deleted": deleted_count}, message="Bulk deleted")

    if extra_routes is not None:
        extra_routes(router)

    return router
