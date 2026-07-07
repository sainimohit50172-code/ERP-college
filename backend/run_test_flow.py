from app.core.config import get_settings
from sqlalchemy import create_engine, text

settings = get_settings()
engine = create_engine(settings.database_url, future=True)
conn = engine.connect()

try:
    hostel = conn.execute(text("SELECT id FROM hostels WHERE name='Main Hostel' ORDER BY id DESC LIMIT 1")).fetchone()
    if hostel is None:
        conn.execute(text("""
        INSERT INTO hostels (name, address, capacity, created_at)
        VALUES ('Main Hostel', 'Block A', 100, NOW())
        """))
        conn.commit()
        hostel = conn.execute(text("SELECT id FROM hostels WHERE name='Main Hostel' ORDER BY id DESC LIMIT 1")).fetchone()
    hostel_id = hostel[0]
    print('HOSTEL', hostel)

    conn.execute(text("""
    INSERT INTO rooms (hostel_id, room_no, capacity, building, floor, has_projector, has_lab, has_ac, status, gender)
    VALUES (:hostel_id, 'CS-101', 40, 'Block A', '2', 1, 0, 1, 'Active', 'Coed')
    """), {'hostel_id': hostel_id})
    conn.commit()
    room = conn.execute(text("SELECT id, room_no, building, floor, has_projector, has_ac FROM rooms WHERE room_no='CS-101' ORDER BY id DESC LIMIT 1")).fetchone()
    print('ROOM', room)

    department = conn.execute(text("SELECT id, code, name FROM departments WHERE code='CS' ORDER BY id DESC LIMIT 1")).fetchone()
    if department is None:
        conn.execute(text("""
        INSERT INTO departments (code, name, description, created_at, updated_at)
        VALUES ('CS', 'Computer Science', 'Computer Science Department', NOW(), NOW())
        """))
        conn.commit()
        department = conn.execute(text("SELECT id, code, name FROM departments WHERE code='CS' ORDER BY id DESC LIMIT 1")).fetchone()
    print('DEPARTMENT', department)

    employee = conn.execute(text("SELECT id, employee_no, first_name, last_name, status FROM employees WHERE employee_no='EMP-001' ORDER BY id DESC LIMIT 1")).fetchone()
    if employee is None:
        conn.execute(text("""
        INSERT INTO employees (employee_no, first_name, last_name, status, contact, department_id, created_at, updated_at)
        VALUES ('EMP-001', 'Rahul', 'Sharma', 'Active', JSON_OBJECT('email','rahul@college.com'), :dept_id, NOW(), NOW())
        """), {'dept_id': department[0]})
        conn.commit()
        employee = conn.execute(text("SELECT id, employee_no, first_name, last_name, status FROM employees WHERE employee_no='EMP-001' ORDER BY id DESC LIMIT 1")).fetchone()
    print('EMPLOYEE', employee)

    teacher = conn.execute(text("SELECT id, employee_id, teacher_code FROM teachers WHERE teacher_code='TCH-001' ORDER BY id DESC LIMIT 1")).fetchone()
    if teacher is None:
        conn.execute(text("""
        INSERT INTO teachers (employee_id, teacher_code, created_at, updated_at)
        VALUES (:employee_id, 'TCH-001', NOW(), NOW())
        """), {'employee_id': employee[0]})
        conn.commit()
        teacher = conn.execute(text("SELECT id, employee_id, teacher_code FROM teachers WHERE teacher_code='TCH-001' ORDER BY id DESC LIMIT 1")).fetchone()
    print('TEACHER', teacher)

    student = conn.execute(text("SELECT id, first_name, last_name, admission_no, gender, contact FROM students WHERE admission_no='ADM-2024-001' ORDER BY id DESC LIMIT 1")).fetchone()
    if student is None:
        conn.execute(text("""
        INSERT INTO students (admission_no, first_name, last_name, gender, status, contact, created_at, updated_at)
        VALUES ('ADM-2024-001', 'Amit', 'Kumar', 'M', 'Active', JSON_OBJECT('email','amit@test.com','phone','9876543210'), NOW(), NOW())
        """))
        conn.commit()
        student = conn.execute(text("SELECT id, first_name, last_name, admission_no, gender, contact FROM students WHERE admission_no='ADM-2024-001' ORDER BY id DESC LIMIT 1")).fetchone()
    print('STUDENT', student)
finally:
    conn.close()
