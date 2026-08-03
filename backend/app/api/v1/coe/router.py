from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func

from app.db.database import get_db
from app.models.exam_fee_setup.admit_card_preferences import CoeAdmitCardPreferences
from app.models.exam_fee_setup.exam_bundle import CoeManageBundle
from app.models.exam_fee_setup.exam_shift import CoeExamShift
from app.models.exam_fee_setup.masking_number_setup import CoeMaskingNumberSetup
from app.models.exam_form_preferences.settings_models import CoeExamFormPreferenceSetting
from app.schemas.exam_form_preferences.settings_schemas import (
    CoeExamFormPreferenceSettingsDetail,
    CoeExamFormPreferenceSettingsUpdate,
)
from app.schemas.exam_fee_setup.admit_card_preferences import (
    AdmitCardPreferencesDetail,
    AdmitCardPreferencesUpdate,
)
from app.schemas.exam_fee_setup.exam_bundle import (
    CoeManageBundleCreate,
    CoeManageBundleDetail,
    CoeManageBundleUpdate,
)
from app.schemas.exam_fee_setup.exam_shift import (
    CoeExamShiftCreate,
    CoeExamShiftDetail,
)
from app.schemas.exam_fee_setup.masking_number_setup import (
    CoeMaskingNumberSetupCreate,
    CoeMaskingNumberSetupDetail,
    CoeMaskingNumberSetupUpdate,
)
from app.schemas.shared.base import APIResponse

router = APIRouter(prefix="/coe", tags=["coe"])


@router.get("/preferences", response_model=APIResponse[CoeExamFormPreferenceSettingsDetail])
def get_coe_preferences(db=Depends(get_db)):
    item = db.execute(select(CoeExamFormPreferenceSetting).order_by(CoeExamFormPreferenceSetting.id.asc()).limit(1)).scalars().first()
    if item is None:
        return APIResponse(data=CoeExamFormPreferenceSettingsDetail(id=0), message="COE preferences loaded")
    return APIResponse(data=CoeExamFormPreferenceSettingsDetail.model_validate(item), message="COE preferences loaded")


@router.put("/preferences", response_model=APIResponse[CoeExamFormPreferenceSettingsDetail])
def update_coe_preferences(payload: CoeExamFormPreferenceSettingsUpdate, db=Depends(get_db)):
    item = db.execute(select(CoeExamFormPreferenceSetting).order_by(CoeExamFormPreferenceSetting.id.asc()).limit(1)).scalars().first()
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    if item is None:
        item = CoeExamFormPreferenceSetting(**values)
        db.add(item)
    else:
        for key, value in values.items():
            setattr(item, key, value)
        item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeExamFormPreferenceSettingsDetail.model_validate(item), message="COE preferences saved")


@router.get("/admit-card-preferences", response_model=APIResponse[AdmitCardPreferencesDetail])
def get_admit_card_preferences(db=Depends(get_db)):
    item = db.execute(select(CoeAdmitCardPreferences).order_by(CoeAdmitCardPreferences.id.asc()).limit(1)).scalars().first()
    if item is None:
        return APIResponse(data=AdmitCardPreferencesDetail(), message="Admit card preferences loaded")
    return APIResponse(data=AdmitCardPreferencesDetail.model_validate(item), message="Admit card preferences loaded")


@router.put("/admit-card-preferences", response_model=APIResponse[AdmitCardPreferencesDetail])
def update_admit_card_preferences(payload: AdmitCardPreferencesUpdate, db=Depends(get_db)):
    item = db.execute(select(CoeAdmitCardPreferences).order_by(CoeAdmitCardPreferences.id.asc()).limit(1)).scalars().first()
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    if item is None:
        item = CoeAdmitCardPreferences(**values)
        db.add(item)
    else:
        for key, value in values.items():
            setattr(item, key, value)
        item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=AdmitCardPreferencesDetail.model_validate(item), message="Admit card preferences saved")


@router.get("/exam-shifts", response_model=APIResponse[list[CoeExamShiftDetail]])
def list_exam_shifts(db=Depends(get_db)):
    items = db.execute(select(CoeExamShift).order_by(CoeExamShift.id.asc())).scalars().all()
    return APIResponse(data=[CoeExamShiftDetail.model_validate(item) for item in items], message="Exam shifts loaded")


@router.post("/exam-shifts", response_model=APIResponse[CoeExamShiftDetail])
def create_exam_shift(payload: CoeExamShiftCreate, db=Depends(get_db)):
    shift_name = payload.shift_name.strip()
    duplicate = db.execute(
        select(CoeExamShift).where(func.lower(CoeExamShift.shift_name) == shift_name.lower())
    ).scalars().first()
    if duplicate is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate Shift Name not allowed.")

    item = CoeExamShift(
        shift_name=shift_name,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=payload.status or 'Active',
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeExamShiftDetail.model_validate(item), message="Exam shift created")


@router.get("/masking-number-setup", response_model=APIResponse[list[CoeMaskingNumberSetupDetail]])
def list_masking_number_setups(db=Depends(get_db)):
    items = db.execute(
        select(CoeMaskingNumberSetup)
        .where(CoeMaskingNumberSetup.deleted_at.is_(None))
        .order_by(CoeMaskingNumberSetup.id.asc())
    ).scalars().all()
    return APIResponse(data=[CoeMaskingNumberSetupDetail.model_validate(item) for item in items], message="Masking number settings loaded")


@router.get("/masking-number-setup/{entity_id}", response_model=APIResponse[CoeMaskingNumberSetupDetail])
def get_masking_number_setup(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeMaskingNumberSetup, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Masking number setup not found")
    return APIResponse(data=CoeMaskingNumberSetupDetail.model_validate(item), message="Masking number setup loaded")


@router.post("/masking-number-setup", response_model=APIResponse[CoeMaskingNumberSetupDetail], status_code=status.HTTP_201_CREATED)
def create_masking_number_setup(payload: CoeMaskingNumberSetupCreate, db=Depends(get_db)):
    name = payload.name.strip()
    duplicate = db.execute(
        select(CoeMaskingNumberSetup).where(
            func.lower(CoeMaskingNumberSetup.name) == name.lower(),
            CoeMaskingNumberSetup.deleted_at.is_(None),
        )
    ).scalars().first()
    if duplicate is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Masking number setup name must be unique.")

    values = payload.model_dump(by_alias=False)
    values.pop("generation_type", None)
    item = CoeMaskingNumberSetup(**values)
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeMaskingNumberSetupDetail.model_validate(item), message="Masking number setup created")


@router.put("/masking-number-setup/{entity_id}", response_model=APIResponse[CoeMaskingNumberSetupDetail])
def update_masking_number_setup(entity_id: int, payload: CoeMaskingNumberSetupUpdate, db=Depends(get_db)):
    item = db.get(CoeMaskingNumberSetup, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Masking number setup not found")
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    values.pop("generation_type", None)
    if "name" in values:
        duplicate = db.execute(
            select(CoeMaskingNumberSetup).where(
                func.lower(CoeMaskingNumberSetup.name) == values["name"].lower(),
                CoeMaskingNumberSetup.id != entity_id,
                CoeMaskingNumberSetup.deleted_at.is_(None),
            )
        ).scalars().first()
        if duplicate is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Masking number setup name must be unique.")
    for key, value in values.items():
        setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeMaskingNumberSetupDetail.model_validate(item), message="Masking number setup updated")


@router.patch("/masking-number-setup/{entity_id}/status", response_model=APIResponse[CoeMaskingNumberSetupDetail])
def update_masking_number_setup_status(entity_id: int, status_value: str, db=Depends(get_db)):
    if status_value not in {"Active", "Inactive", "Draft"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid status")
    item = db.get(CoeMaskingNumberSetup, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Masking number setup not found")
    item.status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeMaskingNumberSetupDetail.model_validate(item), message="Masking number setup status updated")


@router.delete("/masking-number-setup/{entity_id}", response_model=APIResponse[dict[str, bool]])
def delete_masking_number_setup(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeMaskingNumberSetup, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Masking number setup not found")
    item.status = "Inactive"
    item.deleted_at = datetime.utcnow()
    item.updated_at = datetime.utcnow()
    db.commit()
    return APIResponse(data={"success": True}, message="Masking number setup deleted successfully")


@router.get("/manage-bundles", response_model=APIResponse[list[CoeManageBundleDetail]])
def list_manage_bundles(db=Depends(get_db)):
    items = db.execute(
        select(CoeManageBundle)
        .where(CoeManageBundle.deleted_at.is_(None))
        .order_by(CoeManageBundle.id.asc())
    ).scalars().all()
    return APIResponse(data=[CoeManageBundleDetail.model_validate(item) for item in items], message="Manage bundles loaded")


@router.get("/manage-bundles/{entity_id}", response_model=APIResponse[CoeManageBundleDetail])
def get_manage_bundle(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeManageBundle, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manage bundle not found")
    return APIResponse(data=CoeManageBundleDetail.model_validate(item), message="Manage bundle loaded")


@router.post("/manage-bundles", response_model=APIResponse[CoeManageBundleDetail], status_code=status.HTTP_201_CREATED)
def create_manage_bundle(payload: CoeManageBundleCreate, db=Depends(get_db)):
    name = payload.bundle_name.strip()
    code = payload.bundle_code.strip()
    duplicate = db.execute(
        select(CoeManageBundle).where(
            (func.lower(CoeManageBundle.bundle_name) == name.lower()) | (func.lower(CoeManageBundle.bundle_code) == code.lower()),
            CoeManageBundle.deleted_at.is_(None),
        )
    ).scalars().first()
    if duplicate is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bundle name or code must be unique.")

    item = CoeManageBundle(
        bundle_name=name,
        bundle_code=code,
        bundle_type=payload.bundle_type,
        description=payload.description,
        status=payload.status or 'Active',
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeManageBundleDetail.model_validate(item), message="Bundle created")


@router.put("/manage-bundles/{entity_id}", response_model=APIResponse[CoeManageBundleDetail])
def update_manage_bundle(entity_id: int, payload: CoeManageBundleUpdate, db=Depends(get_db)):
    item = db.get(CoeManageBundle, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manage bundle not found")
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    if "bundle_name" in values or "bundle_code" in values:
        name = values.get("bundle_name", item.bundle_name).strip()
        code = values.get("bundle_code", item.bundle_code).strip()
        duplicate = db.execute(
            select(CoeManageBundle).where(
                (
                    (func.lower(CoeManageBundle.bundle_name) == name.lower())
                    | (func.lower(CoeManageBundle.bundle_code) == code.lower())
                ),
                CoeManageBundle.id != entity_id,
                CoeManageBundle.deleted_at.is_(None),
            )
        ).scalars().first()
        if duplicate is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bundle name or code must be unique.")

    for key, value in values.items():
        setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeManageBundleDetail.model_validate(item), message="Bundle updated")


@router.patch("/manage-bundles/{entity_id}/status", response_model=APIResponse[CoeManageBundleDetail])
def update_manage_bundle_status(entity_id: int, status_value: str, db=Depends(get_db)):
    if status_value not in {"Active", "Inactive", "Draft"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid status")
    item = db.get(CoeManageBundle, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manage bundle not found")
    item.status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeManageBundleDetail.model_validate(item), message="Bundle status updated")


@router.delete("/manage-bundles/{entity_id}", response_model=APIResponse[dict[str, bool]])
def delete_manage_bundle(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeManageBundle, entity_id)
    if item is None or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manage bundle not found")
    item.status = "Inactive"
    item.deleted_at = datetime.utcnow()
    item.updated_at = datetime.utcnow()
    db.commit()
    return APIResponse(data={"success": True}, message="Bundle deleted successfully")
