import os
import sys
sys.path.insert(0, os.getcwd())
from sqlalchemy.orm import class_mapper
from app.core.config import get_settings
from app.db.database import engine, SessionLocal
from app.models.employees.models import Employee
from app.models.academic.models import Designation, Department

print('use_sqlite', get_settings().use_sqlite)
print('Employee relationships', [rel.key for rel in class_mapper(Employee).relationships])
for rel in class_mapper(Employee).relationships:
    print('rel', rel.key, 'local cols', [c.key for c in rel.local_columns], 'target', rel.mapper.class_.__name__)

with SessionLocal() as db:
    print('designation count', db.query(Designation).count())
    print('department count', db.query(Department).count())
    nx = db.query(Designation).filter_by(title='Developer').first()
    print('Developer designation exists', nx)
    if nx is None:
        d = Designation(title='Developer')
        db.add(d)
        db.flush()
        print('created designation id', d.id)
        db.commit()
        print('committed')
