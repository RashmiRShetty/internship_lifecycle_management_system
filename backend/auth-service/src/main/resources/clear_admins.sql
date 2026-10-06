-- Clear all registered admins except the Super Admin
-- This will delete all users with ADMIN role (not SUPER_ADMIN)

DELETE FROM user_credentials 
WHERE role = 'ADMIN';

-- Optional: Reset Super Admin password if needed
-- UPDATE user_credentials 
-- SET password = '$2a$10$your_encoded_password_here'
-- WHERE email = 'admin@internsmart.com';

-- Verify the cleanup
SELECT email, role, approval_status FROM user_credentials WHERE role = 'ADMIN';
