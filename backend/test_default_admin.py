"""Test default admin creation"""
from app.db.database import Base, engine
from app.models.auth import User
from app.main import create_default_admin
from sqlalchemy import func
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Check initial state
db = SessionLocal()
user_count = db.query(func.count(User.id)).scalar()
print(f"Users before: {user_count}")
db.close()

# Create default admin
print("\nCreating default admin...")
create_default_admin()

# Check after
db = SessionLocal()
user_count_after = db.query(func.count(User.id)).scalar()
print(f"Users after: {user_count_after}")

# Verify admin exists
admin = db.query(User).filter(User.username == "admin").first()
if admin:
    print(f"\n✅ SUCCESS: Default admin created!")
    print(f"   Email: {admin.email}")
    print(f"   Username: {admin.username}")
    print(f"   Full Name: {admin.full_name}")
    print(f"   Is Superuser: {admin.is_superuser}")
    print(f"   Is Active: {admin.is_active}")
else:
    print("❌ ERROR: Admin not created")

db.close()
