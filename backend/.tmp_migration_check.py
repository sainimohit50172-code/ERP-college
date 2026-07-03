from app.db.base import Base
import app.models

print('metadata tables:', len(Base.metadata.tables))
print(list(Base.metadata.tables.keys())[:50])
