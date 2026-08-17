from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add the backend path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from app.models.auth import User, Role, UserRole
from app.core.security import get_password_hash
from app.db.database import Base, engine

db_path = os.path.join(os.getcwd(), 'backend', 'college_erp.db')
db_engine = create_engine(f'sqlite:///{db_path}')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
db = SessionLocal()

try:
    # Check if admin user exists by username
    admin_user = db.query(User).filter(User.username == 'admin').first()
    
    if admin_user:
        print(f'Admin user already exists: {admin_user.email}')
        # Update password
        admin_user.hashed_password = get_password_hash('Admin123')
        admin_user.email = 'admin@example.com'  # Update email if needed
        db.commit()
        print(f'Updated password for admin user')
    else:
        # Create admin role if it doesn't exist
        admin_role = db.query(Role).filter(Role.name == 'Admin').first()
        if not admin_role:
            admin_role = Role(name='Admin', description='Administrator', is_builtin=True)
            db.add(admin_role)
            db.flush()
        
        # Create admin user
        admin_user = User(
            email='admin@example.com',
            username='admin',
            hashed_password=get_password_hash('Admin123'),
            full_name='System Administrator',
            is_active=True,
            is_superuser=True,
        )
        db.add(admin_user)
        db.flush()
        
        # Assign Admin role to user
        user_role = UserRole(user_id=admin_user.id, role_id=admin_role.id)
        db.add(user_role)
        
        db.commit()
        print(f'Created admin user: admin@example.com')
        print(f'Admin user ID: {admin_user.id}')

except Exception as e:
    print(f'Error: {e}')
    db.rollback()
finally:
    db.close()
