-- Check Admin User Details
-- This script checks the current admin user information

SELECT 
    ID,
    USERNAME, 
    EMAIL, 
    ROLE, 
    IS_ACTIVE,
    PASSWORD,
    LENGTH(PASSWORD) as password_length
FROM USERS 
WHERE USERNAME = 'admin'; 