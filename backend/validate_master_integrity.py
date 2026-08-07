from app.db.database import engine
from sqlalchemy import text

def main():
    with engine.connect() as conn:
        courses = conn.execute(text('SELECT id, code, department_id FROM courses')).fetchall()
        subjects = conn.execute(text('SELECT id, code, course_id FROM subjects')).fetchall()
        departments = conn.execute(text('SELECT id FROM departments')).fetchall()
        dept_ids = {r[0] for r in departments}

        bad_courses = [c for c in courses if c[2] not in dept_ids]
        course_count = len(courses)
        subject_count = len(subjects)
        bad_subjects = []
        course_ids = {c[0] for c in courses}
        for s in subjects:
            if s[2] not in course_ids:
                bad_subjects.append(s)

        print('course_count', course_count)
        print('subject_count', subject_count)
        print('bad_courses', bad_courses)
        print('bad_subjects', bad_subjects)

if __name__ == '__main__':
    main()
