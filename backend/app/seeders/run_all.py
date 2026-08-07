"""Run all seeders in required order and validate after each step."""
from app.seeders.master import academic as master_academic
from app.seeders.demo import (
    teachers,
    subjects,
    students,
    attendance,
    marks,
    fees,
    library,
    hostel,
    transport,
    examinations,
)


ORDER = [
    (master_academic.seed, None),
    (teachers.seed, teachers.validate),
    (subjects.seed, subjects.validate),
    (students.seed, students.validate),
    (attendance.seed, attendance.validate),
    (marks.seed, marks.validate),
    (fees.seed, fees.validate),
    (library.seed, library.validate),
    (hostel.seed, hostel.validate),
    (transport.seed, transport.validate),
    (examinations.seed, examinations.validate),
]


def run_all():
    results = {}
    for func, validate in ORDER:
        name = func.__module__ + ":" + func.__name__
        print(f"Running {name}...")
        try:
            func()
        except Exception as exc:
            print(f"Seeder {name} failed: {exc}")
            results[name] = {"error": str(exc)}
            break
        if validate:
            try:
                v = validate()
                results[name] = {"validated": v}
                print(f"Validated {name}: {v}")
            except Exception as exc:
                print(f"Validation failed for {name}: {exc}")
                results[name] = {"validation_error": str(exc)}
                break
    return results


if __name__ == "__main__":
    run_all()
