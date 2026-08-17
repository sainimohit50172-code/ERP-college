from sqlalchemy import create_engine, inspect, text
import os

db_path = os.path.join(os.getcwd(), 'backend', 'college_erp.db')
engine = create_engine(f'sqlite:///{db_path}')

# Use inspector to get column info
inspector = inspect(engine)

# Check users table
if 'users' in inspector.get_table_names():
    columns = inspector.get_columns('users')
    print('Users table columns:')
    for col in columns:
        print(f'  {col["name"]}: {col["type"]}')
    
    # Query users
    with engine.connect() as conn:
        result = conn.execute(text('SELECT id, email, username, is_active FROM users'))
        users = result.fetchall()
        print(f'\nUsers in database: {len(users)} users')
        for user in users:
            print(f'  ID: {user[0]}, Email: {user[1]}, Username: {user[2]}, Active: {user[3]}')
else:
    print('Users table not found')
