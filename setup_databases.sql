-- Create databases for all microservices
-- Run this script using: psql -U postgres -f setup_databases.sql

-- Drop existing databases if they exist (Be careful: this deletes data!)
-- DROP DATABASE IF EXISTS internship_auth_db;
-- DROP DATABASE IF EXISTS internship_user_db;
-- DROP DATABASE IF EXISTS internship_db;
-- DROP DATABASE IF EXISTS internship_application_db;
-- DROP DATABASE IF EXISTS internship_report_db;
-- DROP DATABASE IF EXISTS internship_meeting_db;
-- DROP DATABASE IF EXISTS internship_certificate_db;
-- DROP DATABASE IF EXISTS internship_chat_db;
-- DROP DATABASE IF EXISTS internship_notification_db;
-- DROP DATABASE IF EXISTS internship_analytics_db;

-- Create databases
CREATE DATABASE internship_auth_db;
CREATE DATABASE internship_user_db;
CREATE DATABASE internship_db;
CREATE DATABASE internship_application_db;
CREATE DATABASE internship_report_db;
CREATE DATABASE internship_meeting_db;
CREATE DATABASE internship_certificate_db;
CREATE DATABASE internship_chat_db;
CREATE DATABASE internship_notification_db;
CREATE DATABASE internship_analytics_db;
CREATE DATABASE internship_recommendation_db;

-- Create departments table in user database
\c internship_user_db;

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default departments
INSERT INTO departments (name, description, created_by) VALUES
('Civil Engineering', 'Department of Civil Engineering', 'system'),
('Computer Science & Engineering', 'Department of Computer Science & Engineering', 'system'),
('Mechanical Engineering', 'Department of Mechanical Engineering', 'system')
ON CONFLICT (name) DO NOTHING;

\c postgres;

-- Usage instructions:
-- 1. Ensure PostgreSQL is running.
-- 2. Current application settings:
--    Username: postgres
--    Password: the password configured for your local PostgreSQL user
-- 3. Run this file in your terminal:
--    psql -U postgres -f setup_databases.sql
