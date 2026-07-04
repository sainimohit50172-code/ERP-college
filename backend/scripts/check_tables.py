import os
os.environ['MYSQL_HOST']='127.0.0.1'
os.environ['MYSQL_PORT']='3306'
os.environ['MYSQL_USER']='root'
os.environ['MYSQL_PASSWORD']='root'
os.environ['MYSQL_DB']='college_erp'
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import database
from sqlalchemy import inspect

inspector = inspect(database.engine)
print('tables:', inspector.get_table_names())
