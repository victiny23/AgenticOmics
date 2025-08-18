-- Update admin3 to Super Admin role
UPDATE USERS 
SET ROLE = 'Super Admin' 
WHERE USERNAME = 'admin3';

-- Verify the change
SELECT USERNAME, EMAIL, ROLE, IS_ACTIVE FROM USERS WHERE USERNAME = 'admin3'; 