# ERP College — Database Design Document

This document describes the canonical MySQL 8 database blueprint for the College ERP.

## 1. ER Model (textual)
- Core identity: `users` with RBAC (`roles`, `permissions`, `user_roles`, `role_permissions`).
- Academic hierarchy: `academic_years` → `semesters`; `courses` → `subjects`; `academic_classes` → `sections`.
- Student lifecycle: `admissions` → `students` → `guardians`.
- HR: `employees` linked to `designations`, `departments`; `leave_requests`, `payroll_runs`, `payroll_entries`.
- Learning: `exams` → `exam_results`; `attendance_records` for student attendance.
- Library: `library_items` → `book_copies` → `book_issues`, `reservations`, `fines`.
- Hostel: `hostels` → `rooms` → `beds` → `hostel_allocations`.
- Transport: `vehicles`, `drivers`(employees), `routes`, `route_stops`, `vehicle_assignments`.
- Finance: `chart_accounts` → `ledger_accounts` → `journal_entries` + `journal_lines`; `payments`, `receipts`, `budgets`.
- Procurement & Inventory: `vendors` → `purchase_orders` → `purchase_order_lines` → `goods_receipts`; `warehouses`, `inventory_items`, `stock`, `stock_movements`; `asset_register` for fixed assets.
- Cross-cutting: `notifications`, `audit_logs`.

## 2. Table Descriptions (high-level)
- `users`: central identity, email login, flags and metadata.
- `roles`, `permissions`, `user_roles`, `role_permissions`: RBAC model for authorization.
- `auth_sessions`, `password_resets`, `email_verifications`: authentication tokens and lifecycle.
- `departments`, `designations`: organizational metadata.
- `academic_years`, `semesters`, `courses`, `subjects`, `academic_classes`, `sections`: academic catalog and structure.
- `admissions`, `students`, `guardians`: student enrollment lifecycle.
- `employees`, `leave_types`, `leave_requests`, `payroll_runs`, `payroll_entries`: HR and payroll.
- `attendance_records`, `exams`, `exam_results`: attendance and examination results.
- `library_items`, `book_copies`, `book_issues`, `reservations`, `fines`: library management.
- `hostels`, `rooms`, `beds`, `hostel_allocations`, `complaints`, `visitors`: hostel management and complaints.
- `vehicles`, `drivers`, `routes`, `route_stops`, `vehicle_assignments`: transport operations.
- `student_assignments`, `maintenance_requests`: coursework & maintenance tracking.
- `chart_accounts`, `ledger_accounts`, `journal_entries`, `journal_lines`, `budgets`, `payments`, `receipts`: finance and accounting.
- `vendors`, `purchase_requests`, `purchase_orders`, `purchase_order_lines`, `goods_receipts`: procurement.
- `warehouses`, `inventory_items`, `stock`, `stock_movements`, `asset_register`: inventory & asset register.
- `notifications`, `audit_logs`: messaging and auditing.

## 3. Relationship Explanations
- One-to-many: courses → subjects, academic_classes → sections, students → guardians, vendors → purchase_orders.
- Many-to-many (via join tables): users ↔ roles (user_roles), roles ↔ permissions (role_permissions).
- Transactions: purchase_orders ↔ purchase_order_lines; journal_entries ↔ journal_lines.

## 4. Index Strategy
- Use primary key clustered index for all PKs (BIGINT UNSIGNED AUTO_INCREMENT).
- Add unique indexes for natural keys: users.email, students.admission_no, inventory_items.sku, purchase_orders.po_no, journal_entries.entry_no.
- Frequently filtered columns are indexed: attendance_records(date), exam_results(student_id), stock(item_id), stock_movements(created_at).
- Composite indexes for multi-column filters: (payer_type,payer_id), (recipient_type,recipient_id), (resource_type,resource_id) for audit queries.
- Avoid excessive indexes on write-heavy tables; pick indexes matching query patterns.

## 5. Partition Strategy
- Partition large time-series tables by RANGE on YEAR(created_at) or MONTH(created_at):
  - `attendance_records`, `audit_logs`, `stock_movements`, `journal_entries`, `book_issues`.
- Use monthly partitions for very high volumes; quarterly/yearly for moderate volumes.
- Maintain automated partition management jobs to add/drop partitions.

## 6. Archival Strategy
- Hot/Cold strategy: retain recent N months in primary DB; archive older partitions to object storage (Parquet/CSV) with metadata index.
- Archive pipeline: export partition → verify checksum → store manifest → drop partition.
- Keep audit trail for archival ops in a `archive_manifests` service table (not included in initial DDL).

## 7. Backup & Recovery
- Use physical backups (Percona XtraBackup) for full backups; incremental backups daily.
- Enable binary logging and keep binlogs for PITR; store in offsite object storage.
- Test restores regularly; maintain documented recovery runbooks.

## 8. Replication & HA
- Deploy MySQL InnoDB Cluster or Group Replication with at least 3 nodes for HA.
- Use asynchronous replicas for reporting and backups.
- Consider semi-synchronous replication for reduced data loss risk.

## 9. Performance Recommendations
- Set `innodb_buffer_pool_size` to 60-80% of RAM.
- Use `innodb_file_per_table=ON`, `innodb_flush_log_at_trx_commit=1` for durability; tune for performance.
- Use connection pooling (ProxySQL or application pool).
- Offload heavy reporting to read replicas or a data warehouse (ETL via CDC/Debezium).
- Use prepared statements and batch writes for bulk operations.

## 10. Validation Notes
- Foreign keys are declared in `db/ddl/erp_schema.sql` after table creation to avoid circular creation issues.
- Naming conventions: snake_case; plural table names.
- Soft deletes implemented via `deleted_at` where historical retention matters.

## Next steps
- Review and approve this blueprint.
- Optionally generate Alembic migration stubs from the approved DDL.
