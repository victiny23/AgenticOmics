-- Make Jerry a Super Admin to fix file deletion permissions
-- This script should be run in the H2 database console

-- Update Jerry's role to Super Admin
UPDATE users 
SET role = 'Super Admin' 
WHERE username = 'Jerry';

-- Verify the change
SELECT username, role, is_active 
FROM users 
WHERE username = 'Jerry';

-- Check all users and their roles
SELECT username, role, is_active, created_at 
FROM users 
ORDER BY username;
