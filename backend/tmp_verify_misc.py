import os
import sys
sys.path.insert(0, os.getcwd())
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from app.db.database import engine
from app.models.finance.models import MiscellaneousRemark

Session = sessionmaker(bind=engine)
session = Session()
try:
    item = MiscellaneousRemark(remark_name='TEST REMARK', remark='Test create', amount=10.50, status='Active')
    session.add(item)
    session.commit()
    print('Inserted ID:', item.id, 'created_at:', item.created_at, 'updated_at:', item.updated_at)
    row = session.execute(text('SELECT id, remark_name, remark, amount, status, created_at, updated_at FROM miscellaneous_remarks WHERE id = :id'), {'id': item.id}).one()
    print('Row:', row)
finally:
    session.rollback()
    session.execute(text('DELETE FROM miscellaneous_remarks WHERE remark_name = :name'), {'name': 'TEST REMARK'})
    session.commit()
    session.close()
