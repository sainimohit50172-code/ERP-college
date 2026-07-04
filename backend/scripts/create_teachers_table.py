import os
import sys
os.environ['MYSQL_HOST']='127.0.0.1'
os.environ['MYSQL_PORT']='3306'
os.environ['MYSQL_USER']='root'
os.environ['MYSQL_PASSWORD']='root'
os.environ['MYSQL_DB']='college_erp'

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import database
from app.models.teachers.models import Teacher

# create only the teachers table if missing
Teacher.__table__.create(bind=database.engine, checkfirst=True)
print('created teachers table (if missing)')
