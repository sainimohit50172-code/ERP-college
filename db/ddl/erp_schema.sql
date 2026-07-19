-- ERP College - Production-ready MySQL 8 Schema
-- Engine: InnoDB
-- Charset: utf8mb4
-- Generated canonical schema for College ERP

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE;
SET SQL_MODE='STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- Core Identity and RBAC
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(320) NOT NULL,
  `username` VARCHAR(64) DEFAULT NULL,
  `hashed_password` VARCHAR(255) DEFAULT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_superuser` TINYINT(1) NOT NULL DEFAULT 0,
  `meta` JSON DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_users_email` (`email`),
  UNIQUE KEY `ux_users_username` (`username`),
  KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_builtin` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(128) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_permissions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `idx_role_permissions_perm` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `idx_user_roles_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_sessions` (
  `id` CHAR(36) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `refresh_token_hash` CHAR(128) NOT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` TIMESTAMP(6) NULL DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_auth_sessions_user` (`user_id`),
  KEY `idx_auth_sessions_token` (`refresh_token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` CHAR(36) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(128) NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` TIMESTAMP(6) NOT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_password_resets_token` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` CHAR(36) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(128) NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` TIMESTAMP(6) NOT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_email_verifications_token` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Academic Catalogs: departments, designations, years, courses, subjects
-- ============================================================

CREATE TABLE IF NOT EXISTS `departments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(32) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_departments_code` (`code`),
  KEY `idx_departments_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `designations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `level` INT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_designations_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_academic_years_name` (`name`),
  KEY `idx_academic_years_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `semesters` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_semesters_year_name` (`academic_year_id`,`name`),
  KEY `idx_semesters_year` (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `department_id` BIGINT UNSIGNED DEFAULT NULL,
  `credits` INT DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_courses_code` (`code`),
  KEY `idx_courses_department` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subjects` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `course_id` BIGINT UNSIGNED DEFAULT NULL,
  `credits` INT DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_subjects_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `academic_classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `course_id` BIGINT UNSIGNED DEFAULT NULL,
  `year_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_academic_classes_name_year` (`name`,`year_id`),
  KEY `idx_academic_classes_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sections` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `class_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `capacity` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_sections_class_name` (`class_id`,`name`),
  KEY `idx_sections_class` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Students, Admissions, Guardians
-- ============================================================

CREATE TABLE IF NOT EXISTS `admissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(320) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `applied_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `status` ENUM('Applied','Accepted','Rejected','Converted') NOT NULL DEFAULT 'Applied',
  `notes` TEXT DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_admissions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `students` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admission_no` VARCHAR(64) DEFAULT NULL,
  `first_name` VARCHAR(128) NOT NULL,
  `last_name` VARCHAR(128) DEFAULT NULL,
  `dob` DATE DEFAULT NULL,
  `gender` ENUM('M','F','O') DEFAULT NULL,
  `class_id` BIGINT UNSIGNED DEFAULT NULL,
  `section_id` BIGINT UNSIGNED DEFAULT NULL,
  `enrollment_date` DATE DEFAULT NULL,
  `status` ENUM('Active','Alumni','Withdrawn') NOT NULL DEFAULT 'Active',
  `contact` JSON DEFAULT NULL,
  `meta` JSON DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_students_admission_no` (`admission_no`),
  KEY `idx_students_class` (`class_id`),
  KEY `idx_students_section` (`section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guardians` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `relationship` VARCHAR(64) DEFAULT NULL,
  `contact` JSON DEFAULT NULL,
  `primary_contact` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_guardians_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Employees, Leave, Payroll
-- ============================================================

CREATE TABLE IF NOT EXISTS `employees` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_no` VARCHAR(64) DEFAULT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `first_name` VARCHAR(128) NOT NULL,
  `last_name` VARCHAR(128) DEFAULT NULL,
  `designation_id` BIGINT UNSIGNED DEFAULT NULL,
  `department_id` BIGINT UNSIGNED DEFAULT NULL,
  `date_of_joining` DATE DEFAULT NULL,
  `status` ENUM('Active','Resigned','Retired') NOT NULL DEFAULT 'Active',
  `contact` JSON DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_employees_employee_no` (`employee_no`),
  KEY `idx_employees_user` (`user_id`),
  KEY `idx_employees_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leave_types` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_leave_types_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `leave_type_id` INT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `days` DECIMAL(5,2) NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` ENUM('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending',
  `approver_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_leave_requests_employee` (`employee_id`),
  KEY `idx_leave_requests_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payroll_runs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `generated_by` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('Draft','Processed','Disbursed') NOT NULL DEFAULT 'Draft',
  `total_amount` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_payroll_runs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payroll_entries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payroll_run_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `gross_amount` DECIMAL(18,2) NOT NULL,
  `net_amount` DECIMAL(18,2) NOT NULL,
  `deductions` JSON DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_payroll_entries_run` (`payroll_run_id`),
  KEY `idx_payroll_entries_emp` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Attendance, Exams, Results
-- ============================================================

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Present','Absent','Excused','Late') NOT NULL,
  `recorded_by` BIGINT UNSIGNED DEFAULT NULL,
  `recorded_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_attendance_student_date` (`student_id`,`date`),
  KEY `idx_attendance_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `exams` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(64) DEFAULT NULL,
  `term` VARCHAR(64) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_exams_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `exam_results` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `exam_id` BIGINT UNSIGNED NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `subject_id` BIGINT UNSIGNED DEFAULT NULL,
  `marks` DECIMAL(7,2) DEFAULT NULL,
  `grade` VARCHAR(8) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_exam_results_exam_student_subject` (`exam_id`,`student_id`,`subject_id`),
  KEY `idx_exam_results_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Library: items, copies, issues, reservations, fines
-- ============================================================

CREATE TABLE IF NOT EXISTS `library_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `isbn` VARCHAR(32) DEFAULT NULL,
  `title` VARCHAR(512) NOT NULL,
  `author` VARCHAR(255) DEFAULT NULL,
  `publisher` VARCHAR(255) DEFAULT NULL,
  `total_copies` INT NOT NULL DEFAULT 1,
  `available_copies` INT NOT NULL DEFAULT 1,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_library_items_isbn` (`isbn`),
  KEY `idx_library_title` (`title`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `book_copies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `copy_no` VARCHAR(64) DEFAULT NULL,
  `barcode` VARCHAR(128) DEFAULT NULL,
  `status` ENUM('Available','OnLoan','Reserved','Lost','Maintenance') NOT NULL DEFAULT 'Available',
  `location` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_book_copies_barcode` (`barcode`),
  KEY `idx_book_copies_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `book_issues` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `copy_id` BIGINT UNSIGNED NOT NULL,
  `borrower_type` ENUM('Student','Employee') NOT NULL,
  `borrower_id` BIGINT UNSIGNED NOT NULL,
  `issued_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `due_on` DATE NOT NULL,
  `returned_on` DATE DEFAULT NULL,
  `fine_amount` DECIMAL(10,2) DEFAULT 0,
  `status` ENUM('Issued','Returned','Overdue','Lost') NOT NULL DEFAULT 'Issued',
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_book_issues_borrower` (`borrower_type`,`borrower_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `borrower_type` ENUM('Student','Employee') NOT NULL,
  `borrower_id` BIGINT UNSIGNED NOT NULL,
  `reserved_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expires_at` TIMESTAMP(6) DEFAULT NULL,
  `status` ENUM('Active','Fulfilled','Cancelled','Expired') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  KEY `idx_reservations_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fines` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `borrower_type` ENUM('Student','Employee') NOT NULL,
  `borrower_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `paid` TINYINT(1) NOT NULL DEFAULT 0,
  `paid_on` TIMESTAMP(6) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_fines_borrower` (`borrower_type`,`borrower_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Hostel: hostels, rooms, beds, allocations, complaints, visitors
-- ============================================================

CREATE TABLE IF NOT EXISTS `hostels` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `capacity` INT DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_hostels_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `hostel_id` BIGINT UNSIGNED NOT NULL,
  `room_no` VARCHAR(64) NOT NULL,
  `capacity` INT DEFAULT 1,
  `gender` ENUM('M','F','Coed') DEFAULT 'Coed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_rooms_hostel_roomno` (`hostel_id`,`room_no`),
  KEY `idx_rooms_hostel` (`hostel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beds` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` BIGINT UNSIGNED NOT NULL,
  `bed_no` VARCHAR(32) DEFAULT NULL,
  `occupied` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_beds_room_bedno` (`room_id`,`bed_no`),
  KEY `idx_beds_room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hostel_allocations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `bed_id` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `status` ENUM('Active','Completed','Cancelled') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_hostel_allocations_bed` (`bed_id`),
  KEY `idx_hostel_allocations_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `complaints` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lodged_by_type` ENUM('Student','Employee','Visitor') NOT NULL,
  `lodged_by_id` BIGINT UNSIGNED NOT NULL,
  `category` VARCHAR(128) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Open','InProgress','Resolved','Closed') DEFAULT 'Open',
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_complaints_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `helpdesk_tickets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(64) NOT NULL,
  `lodged_by_type` ENUM('Student','Employee','Visitor','Other') NOT NULL DEFAULT 'Employee',
  `lodged_by_id` BIGINT UNSIGNED NOT NULL,
  `requester_email` VARCHAR(320) DEFAULT NULL,
  `requester_phone` VARCHAR(64) DEFAULT NULL,
  `category` VARCHAR(128) DEFAULT NULL,
  `priority` ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  `impact` VARCHAR(128) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Open','InProgress','Resolved','Closed') NOT NULL DEFAULT 'Open',
  `assigned_to_type` VARCHAR(64) DEFAULT NULL,
  `assigned_to_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_helpdesk_tickets_number` (`ticket_number`),
  KEY `idx_helpdesk_tickets_status` (`status`),
  KEY `idx_helpdesk_tickets_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `helpdesk_ticket_attachments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` BIGINT UNSIGNED DEFAULT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `content_type` VARCHAR(128) DEFAULT NULL,
  `size` BIGINT UNSIGNED DEFAULT NULL,
  `uploaded_by_type` VARCHAR(20) DEFAULT NULL,
  `uploaded_by_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_helpdesk_ticket_attachments_ticket` (`ticket_id`),
  CONSTRAINT `fk_helpdesk_ticket_attachments_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `helpdesk_tickets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `visitors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(255) DEFAULT NULL,
  `visited_for` VARCHAR(255) DEFAULT NULL,
  `in_time` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `out_time` TIMESTAMP(6) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_visitors_in_time` (`in_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Transport: vehicles, drivers, routes, stops, assignments
-- ============================================================

CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `registration_no` VARCHAR(64) NOT NULL,
  `model` VARCHAR(128) DEFAULT NULL,
  `capacity` INT DEFAULT 0,
  `status` ENUM('Active','Maintenance','Retired') DEFAULT 'Active',
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_vehicles_reg` (`registration_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `drivers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `license_no` VARCHAR(128) DEFAULT NULL,
  `contact` JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_drivers_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `routes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_routes_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `route_stops` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id` BIGINT UNSIGNED NOT NULL,
  `stop_sequence` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9,6) DEFAULT NULL,
  `longitude` DECIMAL(9,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_route_stops_route_seq` (`route_id`,`stop_sequence`),
  KEY `idx_route_stops_route` (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vehicle_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` BIGINT UNSIGNED NOT NULL,
  `driver_id` BIGINT UNSIGNED DEFAULT NULL,
  `route_id` BIGINT UNSIGNED DEFAULT NULL,
  `assigned_on` DATE NOT NULL,
  `released_on` DATE DEFAULT NULL,
  `status` ENUM('Assigned','Released') DEFAULT 'Assigned',
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_assignments_vehicle` (`vehicle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Assignments & Maintenance
-- ============================================================

CREATE TABLE IF NOT EXISTS `student_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `due_date` DATE DEFAULT NULL,
  `submitted` TINYINT(1) DEFAULT 0,
  `grade` VARCHAR(16) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_student_assignments_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `maintenance_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `raised_by_type` ENUM('Student','Employee') NOT NULL,
  `raised_by_id` BIGINT UNSIGNED NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Open','Assigned','InProgress','Completed') DEFAULT 'Open',
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_maintenance_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Finance: chart_accounts, ledger, journal, budgets, payments, receipts
-- ============================================================

CREATE TABLE IF NOT EXISTS `chart_accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL,
  `account_type` ENUM('Asset','Liability','Equity','Income','Expense') NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_chart_accounts_code` (`code`),
  KEY `idx_chart_accounts_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ledger_accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `chart_account_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `balance` DECIMAL(18,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ledger_chart` (`chart_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `journal_entries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_no` VARCHAR(128) NOT NULL,
  `date` DATE NOT NULL,
  `narration` TEXT DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_journal_entries_no` (`entry_no`),
  KEY `idx_journal_entries_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `journal_lines` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `journal_entry_id` BIGINT UNSIGNED NOT NULL,
  `ledger_account_id` BIGINT UNSIGNED NOT NULL,
  `debit` DECIMAL(18,2) DEFAULT 0,
  `credit` DECIMAL(18,2) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_journal_lines_entry` (`journal_entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `budgets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ledger_account_id` BIGINT UNSIGNED NOT NULL,
  `year_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_budgets_ledger_year` (`ledger_account_id`,`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_no` VARCHAR(128) NOT NULL,
  `payer_type` ENUM('Student','Vendor','Employee') NOT NULL,
  `payer_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `method` VARCHAR(64) DEFAULT NULL,
  `reference` VARCHAR(255) DEFAULT NULL,
  `ledger_account_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_payments_no` (`payment_no`),
  KEY `idx_payments_payer` (`payer_type`,`payer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `receipts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `receipt_no` VARCHAR(128) NOT NULL,
  `recipient_type` ENUM('Student','Vendor','Employee') NOT NULL,
  `recipient_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `method` VARCHAR(64) DEFAULT NULL,
  `reference` VARCHAR(255) DEFAULT NULL,
  `ledger_account_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_receipts_no` (`receipt_no`),
  KEY `idx_receipts_recipient` (`recipient_type`,`recipient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Vendors, Procurement, Purchase Orders, Goods Receipts
-- ============================================================

CREATE TABLE IF NOT EXISTS `vendors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `gst_no` VARCHAR(64) DEFAULT NULL,
  `contact` JSON DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_vendors_gst` (`gst_no`),
  KEY `idx_vendors_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `requested_by` BIGINT UNSIGNED DEFAULT NULL,
  `requested_for_department` BIGINT UNSIGNED DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `requested_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `status` ENUM('Draft','Submitted','Approved','Rejected','Converted') DEFAULT 'Draft',
  PRIMARY KEY (`id`),
  KEY `idx_pr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `po_no` VARCHAR(128) NOT NULL,
  `vendor_id` BIGINT UNSIGNED NOT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('Draft','Ordered','PartiallyReceived','Completed','Cancelled') DEFAULT 'Draft',
  `total_amount` DECIMAL(18,2) DEFAULT 0,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_purchase_orders_no` (`po_no`),
  KEY `idx_purchase_orders_vendor` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_order_lines` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `purchase_order_id` BIGINT UNSIGNED NOT NULL,
  `product_sku` VARCHAR(128) DEFAULT NULL,
  `product_name` VARCHAR(512) DEFAULT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(18,2) NOT NULL,
  `received_quantity` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_pol_po` (`purchase_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `goods_receipts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `grn_no` VARCHAR(128) NOT NULL,
  `purchase_order_id` BIGINT UNSIGNED NOT NULL,
  `received_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `received_by` BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_goods_receipts_no` (`grn_no`),
  KEY `idx_goods_receipts_po` (`purchase_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Inventory, Warehouses, Stock, Asset Register
-- ============================================================

CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_warehouses_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(128) NOT NULL,
  `name` VARCHAR(512) NOT NULL,
  `category` VARCHAR(128) DEFAULT NULL,
  `unit` VARCHAR(32) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_inventory_items_sku` (`sku`),
  KEY `idx_inventory_name` (`name`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `warehouse_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `reserved` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_stock_warehouse_item` (`warehouse_id`,`item_id`),
  KEY `idx_stock_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `warehouse_id` BIGINT UNSIGNED NOT NULL,
  `movement_type` ENUM('Receipt','Issue','Transfer','Adjustment') NOT NULL,
  `qty` INT NOT NULL,
  `reference_type` VARCHAR(64) DEFAULT NULL,
  `reference_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_stock_movements_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asset_register` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `asset_tag` VARCHAR(128) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(128) DEFAULT NULL,
  `purchase_date` DATE DEFAULT NULL,
  `cost` DECIMAL(18,2) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `assigned_to_type` ENUM('Student','Employee','Department','None') DEFAULT 'None',
  `assigned_to_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('Active','Disposed','Maintenance') DEFAULT 'Active',
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_asset_register_tag` (`asset_tag`),
  KEY `idx_asset_assigned` (`assigned_to_type`,`assigned_to_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Notifications and Audit
-- ============================================================

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `template_code` VARCHAR(128) DEFAULT NULL,
  `channel` ENUM('email','sms','push','inapp') NOT NULL DEFAULT 'inapp',
  `payload` JSON DEFAULT NULL,
  `status` ENUM('Pending','Sent','Failed','Read') NOT NULL DEFAULT 'Pending',
  `provider_response` JSON DEFAULT NULL,
  `scheduled_at` TIMESTAMP(6) DEFAULT NULL,
  `sent_at` TIMESTAMP(6) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_id` BIGINT UNSIGNED DEFAULT NULL,
  `actor_type` VARCHAR(64) DEFAULT NULL,
  `action` VARCHAR(128) NOT NULL,
  `resource_type` VARCHAR(128) DEFAULT NULL,
  `resource_id` VARCHAR(128) DEFAULT NULL,
  `before_state` JSON DEFAULT NULL,
  `after_state` JSON DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_audit_actor` (`actor_id`),
  KEY `idx_audit_resource` (`resource_type`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Foreign Key Constraints
-- (declared after tables to avoid ordering issues)
-- ============================================================

-- RBAC FKs
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_permissions_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `fk_auth_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `email_verifications`
  ADD CONSTRAINT `fk_email_verifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Departments
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_departments_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Semesters -> Academic years
ALTER TABLE `semesters`
  ADD CONSTRAINT `fk_semesters_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE;

-- Courses/subjects/classes
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

ALTER TABLE `subjects`
  ADD CONSTRAINT `fk_subjects_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

ALTER TABLE `academic_classes`
  ADD CONSTRAINT `fk_academic_classes_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_academic_classes_year` FOREIGN KEY (`year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL;

ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_class` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE;

-- Admissions/Students/Guardians
ALTER TABLE `admissions`
  ADD CONSTRAINT `fk_admissions_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_admissions_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_class` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_students_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_students_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_students_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `guardians`
  ADD CONSTRAINT `fk_guardians_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

-- Employees, leave, payroll
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_employees_designation` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_employees_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_leave_requests_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leave_requests_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_leave_requests_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

ALTER TABLE `payroll_runs`
  ADD CONSTRAINT `fk_payroll_runs_generated_by` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `payroll_entries`
  ADD CONSTRAINT `fk_payroll_entries_run` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payroll_entries_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

-- Attendance, exams, results
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_recorded_by` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `exam_results`
  ADD CONSTRAINT `fk_exam_results_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_exam_results_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_exam_results_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL;

-- Library FKs
ALTER TABLE `book_copies`
  ADD CONSTRAINT `fk_book_copies_item` FOREIGN KEY (`item_id`) REFERENCES `library_items` (`id`) ON DELETE CASCADE;

ALTER TABLE `book_issues`
  ADD CONSTRAINT `fk_book_issues_copy` FOREIGN KEY (`copy_id`) REFERENCES `book_copies` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_book_issues_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservations_item` FOREIGN KEY (`item_id`) REFERENCES `library_items` (`id`) ON DELETE CASCADE;

-- Hostel FKs
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_rooms_hostel` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;

ALTER TABLE `beds`
  ADD CONSTRAINT `fk_beds_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

ALTER TABLE `hostel_allocations`
  ADD CONSTRAINT `fk_hostel_allocations_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hostel_allocations_bed` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`id`) ON DELETE RESTRICT;

-- Transport FKs
ALTER TABLE `drivers`
  ADD CONSTRAINT `fk_drivers_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

ALTER TABLE `route_stops`
  ADD CONSTRAINT `fk_route_stops_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE;

ALTER TABLE `vehicle_assignments`
  ADD CONSTRAINT `fk_vehicle_assignments_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_assignments_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_assignments_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL;

-- Finance FKs
ALTER TABLE `ledger_accounts`
  ADD CONSTRAINT `fk_ledger_chart` FOREIGN KEY (`chart_account_id`) REFERENCES `chart_accounts` (`id`) ON DELETE CASCADE;

ALTER TABLE `journal_entries`
  ADD CONSTRAINT `fk_journal_entries_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `journal_lines`
  ADD CONSTRAINT `fk_journal_lines_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_journal_lines_ledger` FOREIGN KEY (`ledger_account_id`) REFERENCES `ledger_accounts` (`id`) ON DELETE RESTRICT;

ALTER TABLE `budgets`
  ADD CONSTRAINT `fk_budgets_ledger` FOREIGN KEY (`ledger_account_id`) REFERENCES `ledger_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_budgets_year` FOREIGN KEY (`year_id`) REFERENCES `academic_years` (`id`) ON DELETE RESTRICT;

ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_ledger` FOREIGN KEY (`ledger_account_id`) REFERENCES `ledger_accounts` (`id`) ON DELETE SET NULL;

ALTER TABLE `receipts`
  ADD CONSTRAINT `fk_receipts_ledger` FOREIGN KEY (`ledger_account_id`) REFERENCES `ledger_accounts` (`id`) ON DELETE SET NULL;

-- Procurement FKs
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `fk_pr_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pr_dept` FOREIGN KEY (`requested_for_department`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `fk_purchase_orders_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_purchase_orders_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `purchase_order_lines`
  ADD CONSTRAINT `fk_pol_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE;

ALTER TABLE `goods_receipts`
  ADD CONSTRAINT `fk_goods_receipts_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_goods_receipts_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Inventory/Stock FKs
ALTER TABLE `stock`
  ADD CONSTRAINT `fk_stock_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_item` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE;

ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_stock_movements_item` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_movements_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_movements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Notifications/Audit FKs
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ============================================================
-- End of schema
-- Restore session variables
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- Notes:
-- This DDL is canonical blueprint. Partitioning, storage engine tuning and materialized aggregates are recommended for production.
