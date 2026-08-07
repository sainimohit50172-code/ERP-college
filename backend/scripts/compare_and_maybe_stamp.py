"""Compare an Alembic migration create_table with an existing SQLite table and
stamp the migration if schemas are equivalent.

Usage: python compare_and_maybe_stamp.py <revision> <table_name>
"""
import re
import sys
import subprocess
from pathlib import Path
from app.db.database import engine
from sqlalchemy import text, inspect


TYPE_MAP = {
    "BigInteger": "INTEGER",
    "Integer": "INTEGER",
    "String": "VARCHAR",
    "Text": "TEXT",
    "DateTime": "DATETIME",
    "BOOLEAN": "BOOLEAN",
}


def parse_migration_file(mig_path: Path, table_name: str):
    src = mig_path.read_text()
    # find op.create_table('table_name', ...)
    m = re.search(r"op\.create_table\(\s*['\"]" + re.escape(table_name) + r"['\"]\s*,(.*?)\)\s*\)", src, re.S)
    if not m:
        # try looser: find start and then up to next op.create_index or end
        m2 = re.search(r"op\.create_table\(\s*['\"]" + re.escape(table_name) + r"['\"]\s*,(.*)\n\s*\)\s*\n", src, re.S)
        if not m2:
            return None
        body = m2.group(1)
    else:
        body = m.group(1)

    cols = []
    for col_m in re.finditer(r"sa\.Column\s*\(\s*['\"](\w+)['\"]\s*,\s*sa\.([A-Za-z_]+)(?:\([^\)]*\))?([\s\S]*?)\)\s*,?", body):
        name = col_m.group(1)
        sa_type = col_m.group(2)
        rest = col_m.group(3)
        nullable = not ("nullable=False" in rest)
        cols.append((name, sa_type, nullable))

    pk = False
    if "PrimaryKeyConstraint" in body or "sa.PrimaryKeyConstraint" in body:
        pk = True

    # indexes
    idxs = []
    for im in re.finditer(r"op\.create_index\(.*?\,\s*['\"]" + re.escape(table_name) + r"['\"]\s*,\s*\[(.*?)\]", src, re.S):
        # fallback; simpler: find op.create_index(..., 'tablename', ['col'])
        pass
    # simpler: search for ix_<table> patterns and columns
    idxs = re.findall(r"op\.create_index\(op\.f\('ix_([\w_]+)'\)\s*,\s*'" + re.escape(table_name) + r"'\s*,\s*\[([^\]]+)\]", src)
    parsed_idxs = []
    for name, cols_txt in idxs:
        cols_list = [c.strip().strip("'\"") for c in cols_txt.split(",")]
        parsed_idxs.append((name, cols_list))

    return {"columns": cols, "has_pk": pk, "indexes": parsed_idxs}


def get_sqlite_table_info(table_name: str):
    inspector = inspect(engine)
    cols = inspector.get_columns(table_name)
    # inspector returns dicts with name, type, primary_key
    indexes = []
    with engine.connect() as conn:
        try:
            idxs = conn.execute(text(f"PRAGMA index_list('{table_name}')")).fetchall()
        except Exception:
            idxs = []
        for idx in idxs:
            name = idx[1]
            info = conn.execute(text(f"PRAGMA index_info('{name}')")).fetchall()
            cols_in_idx = [r[2] for r in info]
            indexes.append((name, cols_in_idx))
        # foreign keys
        try:
            fks = conn.execute(text(f"PRAGMA foreign_key_list('{table_name}')")).fetchall()
        except Exception:
            fks = []
    return {"columns": cols, "indexes": indexes, "fks": fks}


def compare(mig, actual, table_name: str):
    report = {"column_diffs": [], "pk_ok": True, "index_diffs": [], "fk_count": len(actual.get('fks', []))}

    if not mig:
        report['error'] = 'migration_parsing_failed'
        return report

    mig_cols = mig['columns']
    actual_cols = actual['columns']

    # build maps
    mig_map = {name: TYPE_MAP.get(sa_type, sa_type).upper() for name, sa_type, _ in mig_cols}
    actual_map = {c['name']: str(c['type']).upper() for c in actual_cols}

    for mname, mtype in mig_map.items():
        a = actual_map.get(mname)
        if not a:
            report['column_diffs'].append((mname, mtype, None))
        else:
            # normalize types (VARCHAR(160) -> VARCHAR)
            a_norm = re.sub(r"\(.*\)", "", a)
            m_norm = re.sub(r"\(.*\)", "", mtype)
            if m_norm not in a_norm and a_norm not in m_norm:
                report['column_diffs'].append((mname, mtype, a))

    # check primary key: look for any actual column with primary_key True
    pk_present = any(c.get('primary_key') or c.get('autoincrement') for c in actual_cols)
    report['pk_ok'] = pk_present and mig['has_pk']

    # indexes: compare counts for now
    mig_idx_cols = [tuple(cols) for _, cols in mig.get('indexes', [])]
    act_idx_cols = [tuple(cols) for _, cols in actual.get('indexes', [])]
    if set(mig_idx_cols) != set(act_idx_cols):
        report['index_diffs'] = {'migration_indexes': mig_idx_cols, 'actual_indexes': act_idx_cols}

    return report


def stamp_revision(rev: str):
    # run alembic stamp
    print(f"Stamping revision {rev} as applied")
    proc = subprocess.run([sys.executable, "-m", "alembic", "stamp", rev], cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True)
    print(proc.stdout)
    if proc.returncode != 0:
        print('Stamp failed:', proc.stderr)
        return False
    return True


def main():
    if len(sys.argv) < 3:
        print("usage: compare_and_maybe_stamp.py <revision> <table_name>")
        raise SystemExit(2)
    rev = sys.argv[1]
    table = sys.argv[2]
    mig_file = None
    vdir = Path(__file__).resolve().parents[1] / "alembic" / "versions"
    for f in vdir.glob(f"{rev}_*.py"):
        mig_file = f
        break
    if not mig_file:
        print('Migration file for revision not found')
        raise SystemExit(3)

    print('Parsing migration file', mig_file)
    mig = parse_migration_file(mig_file, table)
    actual = get_sqlite_table_info(table)
    comp = compare(mig, actual, table)
    print('Comparison result:', comp)
    if comp.get('column_diffs') or comp.get('index_diffs') or comp.get('error'):
        print('Schemas differ or parsing failed. Do NOT stamp. Report differences above.')
        raise SystemExit(4)
    # otherwise safe to stamp
    ok = stamp_revision(rev)
    if not ok:
        raise SystemExit(5)
    print('Stamped successfully')


if __name__ == '__main__':
    main()
