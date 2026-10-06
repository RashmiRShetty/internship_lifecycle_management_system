-- Add approval_status column to user_credentials table
ALTER TABLE user_credentials 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'APPROVED';

-- Update existing ADMIN users to have APPROVED status (for backward compatibility)
UPDATE user_credentials 
SET approval_status = 'APPROVED' 
WHERE role = 'ADMIN' AND approval_status IS NULL;

-- Update existing non-ADMIN users to have APPROVED status
UPDATE user_credentials 
SET approval_status = 'APPROVED' 
WHERE role != 'ADMIN' AND approval_status IS NULL;
