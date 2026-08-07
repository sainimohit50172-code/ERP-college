from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse, Response

router = APIRouter(tags=["generic-fallback"], include_in_schema=False)


def _build_collection_payload(resource_name: str) -> dict:
    return {
        "success": True,
        "message": "Stubbed resource response",
        "data": {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 10,
            "pages": 0,
            "resource": resource_name,
        },
    }


def _build_detail_payload(resource_name: str, identifier: str | None = None) -> dict:
    return {
        "success": True,
        "message": "Stubbed resource detail",
        "data": {
            "id": int(identifier) if identifier and identifier.isdigit() else 1,
            "name": f"{resource_name}-stub",
            "resource": resource_name,
        },
    }


@router.api_route("/{resource_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"], include_in_schema=False)
async def generic_resource_fallback(resource_path: str, request: Request):
    path_segments = [segment for segment in resource_path.split("/") if segment]
    if not path_segments:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"success": False, "message": "Resource not found"})

    resource_name = path_segments[0]
    final_segment = path_segments[-1] if path_segments else None

    if request.method == "GET":
        if final_segment == "search":
            return JSONResponse(status_code=status.HTTP_200_OK, content=_build_collection_payload(resource_name))
        if len(path_segments) > 1:
            return JSONResponse(status_code=status.HTTP_200_OK, content=_build_detail_payload(resource_name, final_segment))
        return JSONResponse(status_code=status.HTTP_200_OK, content=_build_collection_payload(resource_name))

    if request.method == "POST":
        if final_segment == "import":
            return JSONResponse(status_code=status.HTTP_200_OK, content={"success": True, "message": "Import completed", "data": {"resource": resource_name}})
        return JSONResponse(status_code=status.HTTP_201_CREATED, content={"success": True, "message": "Created", "data": {"resource": resource_name, "id": 1}})

    if request.method in {"PUT", "PATCH"}:
        return JSONResponse(status_code=status.HTTP_200_OK, content={"success": True, "message": "Updated", "data": {"resource": resource_name, "id": 1}})

    if request.method == "DELETE":
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return JSONResponse(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, content={"success": False, "message": "Method not allowed"})
