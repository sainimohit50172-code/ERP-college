from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime

from app.db.database import get_db
from app.models.certificates.models import Certificate
from app.models.students.models import Student
from app.schemas.certificates.schemas import CertificateCreate, CertificateDetail
from app.schemas.shared.base import APIResponse
from app.core.config import get_settings

router = APIRouter(prefix="/certificates", tags=["certificates"])
settings = get_settings()


@router.get("/{student_id}")
def get_certificate(student_id: int, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.student_id == student_id).order_by(Certificate.created_at.desc()).first()
    if not cert:
        return APIResponse(data=None, message="No certificate found", success=True)
    return APIResponse(data=CertificateDetail.from_orm(cert))


@router.post("/save")
def save_certificate(payload: CertificateCreate, db: Session = Depends(get_db)):
    # create certificate record
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    cert = Certificate(
        student_id=payload.student_id,
        certificate_type=payload.certificate_type,
        issue_date=payload.issue_date,
        status=payload.status or "Draft",
        remarks=payload.remarks,
        created_by=None,
        created_at=datetime.utcnow(),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return APIResponse(data=CertificateDetail.from_orm(cert), message="Certificate saved")


# Simple upload endpoint to store student image files
@router.post("/upload/student-image")
def upload_student_image(student_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    contents_type = file.content_type or ""
    if contents_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image type")

    data = file.file.read()
    if len(data) > 2 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")

    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    uploads_dir = os.path.abspath(uploads_dir)
    os.makedirs(uploads_dir, exist_ok=True)

    # unique filename
    ext = os.path.splitext(file.filename)[1]
    fname = f"student_{student_id}_{int(datetime.utcnow().timestamp())}{ext}"
    fpath = os.path.join(uploads_dir, fname)
    with open(fpath, "wb") as f:
        f.write(data)

    # save path to student.meta.photo_url
    meta = dict(student.meta or {})
    meta["photo_url"] = f"/uploads/{fname}"
    student.meta = meta
    db.add(student)
    db.commit()
    return APIResponse(data={"photo_url": student.meta.get("photo_url")}, message="Upload successful")
