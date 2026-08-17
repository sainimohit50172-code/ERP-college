from app.core.config import get_settings
from sqlalchemy import create_engine, inspect
s=get_settings()
url=(s.resolved_sqlite_url if s.use_sqlite else s.database_url)
engine=create_engine(url)
ins=inspect(engine)
cols=ins.get_columns('payment_modes')
for c in cols:
    print(c['name'], c['type'], c['nullable'], c.get('default'))
