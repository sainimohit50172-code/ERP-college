from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.exam_fee_setup import CoeAdmitCardPreferences, CoeFeeHead, CoeFeeHeadGroup, CoeFeeHeadGroupDetail, CoeReceiptConfiguration
from app.schemas.exam_fee_setup import (
    AdmitCardPreferencesDetail,
    AdmitCardPreferencesUpdate,
    FeeHeadCreate,
    FeeHeadDetail,
    FeeHeadGroupCreate,
    FeeHeadGroupDetail,
    FeeHeadGroupDetailCreate,
    FeeHeadGroupDetailItem,
    FeeHeadGroupUpdate,
    FeeHeadUpdate,
    ReceiptConfigurationCreate,
    ReceiptConfigurationDetail,
    ReceiptConfigurationUpdate,
)
from app.schemas.shared.base import APIResponse

router = APIRouter(prefix="/coe", tags=["coe-exam-fee-setup"])


def _get_admit_card_preferences(db):
    return db.execute(select(CoeAdmitCardPreferences).order_by(CoeAdmitCardPreferences.id.asc()).limit(1)).scalars().first()


def fee_head_detail(item):
    return FeeHeadDetail.model_validate(item)


def _get_configuration(db):
    return db.execute(select(CoeReceiptConfiguration).order_by(CoeReceiptConfiguration.id.asc()).limit(1)).scalars().first()


def _detail(item):
    return ReceiptConfigurationDetail.model_validate(item)


@router.get("/receipt-configuration", response_model=APIResponse[ReceiptConfigurationDetail])
def get_receipt_configuration(db=Depends(get_db)):
    item = _get_configuration(db)
    if item is None:
        item = CoeReceiptConfiguration(receipt_number=0, status="Active")
        return APIResponse(data=_detail(item), message="Receipt configuration loaded")
    return APIResponse(data=_detail(item), message="Receipt configuration loaded")


@router.post("/receipt-configuration", response_model=APIResponse[ReceiptConfigurationDetail], status_code=status.HTTP_201_CREATED)
def create_receipt_configuration(payload: ReceiptConfigurationCreate, db=Depends(get_db)):
    item = _get_configuration(db)
    values = payload.model_dump(by_alias=False)
    if item is None:
        item = CoeReceiptConfiguration(**values)
        db.add(item)
    else:
        for key, value in values.items():
            setattr(item, key, value)
        item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=_detail(item), message="Receipt configuration saved successfully")


@router.put("/receipt-configuration/{entity_id}", response_model=APIResponse[ReceiptConfigurationDetail])
def update_receipt_configuration(entity_id: int, payload: ReceiptConfigurationUpdate, db=Depends(get_db)):
    item = db.get(CoeReceiptConfiguration, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Receipt configuration not found")
    for key, value in payload.model_dump(by_alias=False).items():
        setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=_detail(item), message="Receipt configuration saved successfully")


@router.get("/admit-card-preferences", response_model=APIResponse[AdmitCardPreferencesDetail])
def get_admit_card_preferences(db=Depends(get_db)):
    item = _get_admit_card_preferences(db)
    if item is None:
        return APIResponse(data=AdmitCardPreferencesDetail())
    return APIResponse(data=AdmitCardPreferencesDetail.model_validate(item))


@router.put("/admit-card-preferences", response_model=APIResponse[AdmitCardPreferencesDetail])
def update_admit_card_preferences(payload: AdmitCardPreferencesUpdate, db=Depends(get_db)):
    item = _get_admit_card_preferences(db)
    values = payload.model_dump(by_alias=False)
    if item is None:
        item = CoeAdmitCardPreferences(**values)
        db.add(item)
    else:
        for key, value in values.items():
            setattr(item, key, value)
        item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=AdmitCardPreferencesDetail.model_validate(item), message="Admit Card Preferences Saved Successfully")


@router.get("/fee-heads", response_model=APIResponse[list[FeeHeadDetail]])
def list_fee_heads(db=Depends(get_db)):
    items = db.execute(select(CoeFeeHead).order_by(CoeFeeHead.display_order.asc(), CoeFeeHead.id.asc())).scalars().all()
    return APIResponse(data=[fee_head_detail(item) for item in items])


@router.get("/fee-heads/search", response_model=APIResponse[list[FeeHeadDetail]])
def search_fee_heads(query: str | None = None, db=Depends(get_db)):
    term = f"%{(query or '').strip()}%"
    items = db.execute(select(CoeFeeHead).where(
        CoeFeeHead.fee_head_name.ilike(term) | CoeFeeHead.fee_head_code.ilike(term) | CoeFeeHead.fee_category.ilike(term)
    ).order_by(CoeFeeHead.display_order.asc())).scalars().all()
    return APIResponse(data=[fee_head_detail(item) for item in items])


@router.post("/fee-heads", response_model=APIResponse[FeeHeadDetail], status_code=status.HTTP_201_CREATED)
def create_fee_head(payload: FeeHeadCreate, db=Depends(get_db)):
    duplicate = db.execute(select(CoeFeeHead).where(CoeFeeHead.fee_head_code == payload.fee_head_code)).scalars().first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Fee Head Code must be unique.")
    item = CoeFeeHead(**payload.model_dump(by_alias=False))
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(data=fee_head_detail(item), message="Fee head created successfully")


@router.get("/fee-heads/{entity_id}", response_model=APIResponse[FeeHeadDetail])
def get_fee_head(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeFeeHead, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head not found")
    return APIResponse(data=fee_head_detail(item))


@router.put("/fee-heads/{entity_id}", response_model=APIResponse[FeeHeadDetail])
def update_fee_head(entity_id: int, payload: FeeHeadUpdate, db=Depends(get_db)):
    item = db.get(CoeFeeHead, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head not found")
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    if "fee_head_code" in values:
        duplicate = db.execute(select(CoeFeeHead).where(CoeFeeHead.fee_head_code == values["fee_head_code"], CoeFeeHead.id != entity_id)).scalars().first()
        if duplicate:
            raise HTTPException(status_code=409, detail="Fee Head Code must be unique.")
    for key, value in values.items():
        setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=fee_head_detail(item), message="Fee head updated successfully")


@router.delete("/fee-heads/{entity_id}", response_model=APIResponse[dict[str, bool]])
def delete_fee_head(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeFeeHead, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head not found")
    item.status = "Inactive"
    item.updated_at = datetime.utcnow()
    db.commit()
    return APIResponse(data={"success": True}, message="Fee head deactivated successfully")


@router.patch("/fee-heads/{entity_id}/status", response_model=APIResponse[FeeHeadDetail])
def update_fee_head_status(entity_id: int, status_value: str, db=Depends(get_db)):
    if status_value not in {"Active", "Inactive", "Draft"}:
        raise HTTPException(status_code=422, detail="Invalid status")
    item = db.get(CoeFeeHead, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head not found")
    item.status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=fee_head_detail(item), message="Fee head status updated successfully")


def fee_head_group_detail(item):
    return FeeHeadGroupDetail.model_validate(item)


def _build_fee_head_group(item):
    return CoeFeeHeadGroup(
        group_name=item.group_name,
        group_code=item.group_code,
        status=item.status,
        description=item.description,
        created_by=item.created_by,
        updated_by=item.updated_by,
        details=[
            CoeFeeHeadGroupDetail(
                name=detail.name,
                fee_head_id=detail.fee_head_id,
                created_by=detail.created_by,
                updated_by=detail.updated_by,
            )
            for detail in item.details or []
        ],
    )


@router.get("/fee-head-groups", response_model=APIResponse[list[FeeHeadGroupDetail]])
def list_fee_head_groups(db=Depends(get_db)):
    items = db.execute(
        select(CoeFeeHeadGroup)
        .options(selectinload(CoeFeeHeadGroup.details).selectinload(CoeFeeHeadGroupDetail.fee_head))
        .order_by(CoeFeeHeadGroup.group_name.asc(), CoeFeeHeadGroup.id.asc())
    ).scalars().all()
    return APIResponse(data=[fee_head_group_detail(item) for item in items])


@router.get("/fee-head-groups/search", response_model=APIResponse[list[FeeHeadGroupDetail]])
def search_fee_head_groups(query: str | None = None, db=Depends(get_db)):
    term = f"%{(query or '').strip()}%"
    items = db.execute(select(CoeFeeHeadGroup).where(
        CoeFeeHeadGroup.group_name.ilike(term) | CoeFeeHeadGroup.group_code.ilike(term)
    ).order_by(CoeFeeHeadGroup.group_name.asc())).scalars().all()
    return APIResponse(data=[fee_head_group_detail(item) for item in items])


@router.post("/fee-head-groups", response_model=APIResponse[FeeHeadGroupDetail], status_code=status.HTTP_201_CREATED)
def create_fee_head_group(payload: FeeHeadGroupCreate, db=Depends(get_db)):
    duplicate = db.execute(select(CoeFeeHeadGroup).where(CoeFeeHeadGroup.group_code == payload.group_code)).scalars().first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Fee Head Group Code must be unique.")

    item = CoeFeeHeadGroup(
        group_name=payload.group_name,
        group_code=payload.group_code,
        status=payload.status,
        description=payload.description,
        created_by=payload.created_by,
        updated_by=payload.created_by,
        details=[
            CoeFeeHeadGroupDetail(
                name=detail.name,
                fee_head_id=detail.fee_head_id,
                created_by=detail.created_by,
                updated_by=detail.updated_by,
            )
            for detail in payload.details or []
        ],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(data=fee_head_group_detail(item), message="Fee head group created successfully")


@router.get("/fee-head-groups/{entity_id}", response_model=APIResponse[FeeHeadGroupDetail])
def get_fee_head_group(entity_id: int, db=Depends(get_db)):
    item = db.execute(
        select(CoeFeeHeadGroup)
        .options(selectinload(CoeFeeHeadGroup.details).selectinload(CoeFeeHeadGroupDetail.fee_head))
        .where(CoeFeeHeadGroup.id == entity_id)
    ).scalars().first()
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head group not found")
    return APIResponse(data=fee_head_group_detail(item))


@router.put("/fee-head-groups/{entity_id}", response_model=APIResponse[FeeHeadGroupDetail])
def update_fee_head_group(entity_id: int, payload: FeeHeadGroupUpdate, db=Depends(get_db)):
    item = db.execute(
        select(CoeFeeHeadGroup)
        .options(selectinload(CoeFeeHeadGroup.details).selectinload(CoeFeeHeadGroupDetail.fee_head))
        .where(CoeFeeHeadGroup.id == entity_id)
    ).scalars().first()
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head group not found")
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    if "group_code" in values:
        duplicate = db.execute(select(CoeFeeHeadGroup).where(CoeFeeHeadGroup.group_code == values["group_code"], CoeFeeHeadGroup.id != entity_id)).scalars().first()
        if duplicate:
            raise HTTPException(status_code=409, detail="Fee Head Group Code must be unique.")

    details = values.pop("details", None)
    for key, value in values.items():
        setattr(item, key, value)

    if details is not None:
        item.details = [
            CoeFeeHeadGroupDetail(
                name=detail.name,
                fee_head_id=detail.fee_head_id,
                created_by=detail.created_by,
                updated_by=detail.updated_by,
            )
            for detail in details
        ]

    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=fee_head_group_detail(item), message="Fee head group updated successfully")


@router.delete("/fee-head-groups/{entity_id}", response_model=APIResponse[dict[str, bool]])
def delete_fee_head_group(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeFeeHeadGroup, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head group not found")
    item.status = "Inactive"
    item.updated_at = datetime.utcnow()
    db.commit()
    return APIResponse(data={"success": True}, message="Fee head group deactivated successfully")


@router.patch("/fee-head-groups/{entity_id}/status", response_model=APIResponse[FeeHeadGroupDetail])
def update_fee_head_group_status(entity_id: int, status_value: str, db=Depends(get_db)):
    if status_value not in {"Active", "Inactive", "Draft"}:
        raise HTTPException(status_code=422, detail="Invalid status")
    item = db.get(CoeFeeHeadGroup, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Fee head group not found")
    item.status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=fee_head_group_detail(item), message="Fee head group status updated successfully")
