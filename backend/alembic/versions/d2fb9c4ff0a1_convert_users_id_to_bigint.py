"""Convert legacy INT users.id and referencing foreign keys to BIGINT.

This migration is intentionally database-only. It does not change SQLAlchemy
models, business logic, APIs, or relationships.

Safe rollout:
1. Back up the MySQL/MariaDB database.
2. Apply this migration.
3. Run the verification SQL in scripts/verify_users_bigint_fks.sql.

Rollback:
1. Backup the database again.
2. Recreate the original foreign keys and restore the old column types from a
   backup or from the pre-migration schema definition.
3. If the database is still on the migrated state, the general reverse order is:
   - Drop the recreated foreign keys.
   - Alter the referencing columns back to INT.
   - Alter users.id back to INT.
   - Recreate the original foreign keys with the original definitions.

This migration is MySQL/MariaDB compatible.
"""

from __future__ import annotations

from collections import defaultdict

import sqlalchemy as sa
from alembic import op

from app.db.base import Base

import app.models  # noqa: F401


revision = "d2fb9c4ff0a1"
down_revision = "eedf758aff7f"
branch_labels = None
depends_on = None


def _quote_ident(name: str) -> str:
    return f"`{name.replace('`', '``')}`"


def _fetch_fk_rows(bind) -> list[tuple]:
    return list(
        bind.execute(
            sa.text(
                """
                SELECT
                    kcu.TABLE_NAME,
                    kcu.COLUMN_NAME,
                    kcu.CONSTRAINT_NAME,
                    rc.DELETE_RULE,
                    rc.UPDATE_RULE
                FROM information_schema.KEY_COLUMN_USAGE kcu
                LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
                    ON rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
                   AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                WHERE kcu.TABLE_SCHEMA = DATABASE()
                  AND kcu.REFERENCED_TABLE_SCHEMA = DATABASE()
                  AND kcu.REFERENCED_TABLE_NAME = 'users'
                  AND kcu.REFERENCED_COLUMN_NAME = 'id'
                  AND kcu.CONSTRAINT_NAME <> 'PRIMARY'
                ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME, kcu.ORDINAL_POSITION
                """
            )
        ).fetchall()
    )


def _fetch_column_metadata(bind, table_name: str, column_name: str):
    return bind.execute(
        sa.text(
            """
            SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = :table_name
              AND COLUMN_NAME = :column_name
            """
        ),
        {"table_name": table_name, "column_name": column_name},
    ).fetchone()


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name not in {"mysql", "mariadb"}:
        raise RuntimeError("This migration is only supported for MySQL/MariaDB databases")

    rows = _fetch_fk_rows(bind)
    if not rows:
        # No foreign keys reference users.id; only convert the users.id column itself.
        pass

    grouped = defaultdict(list)
    for row in rows:
        grouped[(row[0], row[2])].append(row)

    for (table_name, constraint_name), fk_rows in grouped.items():
        op.execute(sa.text(f"ALTER TABLE {_quote_ident(table_name)} DROP FOREIGN KEY {_quote_ident(constraint_name)}"))

    users_meta = _fetch_column_metadata(bind, "users", "id")
    if users_meta is None:
        raise RuntimeError("users.id column not found; migration cannot continue")

    op.execute(sa.text("ALTER TABLE `users` MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT"))

    for (table_name, _constraint_name), fk_rows in grouped.items():
        for row in fk_rows:
            column_name = row[1]
            column_meta = _fetch_column_metadata(bind, table_name, column_name)
            if column_meta is None:
                continue
            nullable = "NULL" if column_meta[1] == "YES" else "NOT NULL"
            default_sql = ""
            if column_meta[2] is not None:
                default_sql = f" DEFAULT {column_meta[2]}"
            op.execute(
                sa.text(
                    f"ALTER TABLE {_quote_ident(table_name)} MODIFY COLUMN {_quote_ident(column_name)} BIGINT {nullable}{default_sql}"
                )
            )

    for (table_name, constraint_name), fk_rows in grouped.items():
        column_names = [row[1] for row in fk_rows]
        columns_sql = ", ".join(_quote_ident(column_name) for column_name in column_names)
        rule_rows = [row for row in fk_rows if row[3] is not None or row[4] is not None]
        delete_rule = rule_rows[0][3] if rule_rows else "RESTRICT"
        update_rule = rule_rows[0][4] if rule_rows else "RESTRICT"
        op.execute(
            sa.text(
                f"ALTER TABLE {_quote_ident(table_name)} ADD CONSTRAINT {_quote_ident(constraint_name)} "
                f"FOREIGN KEY ({columns_sql}) REFERENCES {_quote_ident('users')} ({_quote_ident('id')}) "
                f"ON DELETE {delete_rule} ON UPDATE {update_rule}"
            )
        )

    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    raise RuntimeError(
        "This migration is intentionally one-way. Restore from backup or recreate the original schema manually."
    )
