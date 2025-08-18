-- Check All Users and Their Password Hashes
-- This script shows all users and their password hash formats

SELECT 
    ID,
    USERNAME, 
    EMAIL, 
    ROLE, 
    IS_ACTIVE,
    PASSWORD,
    LENGTH(PASSWORD) as password_length,
    LEFT(PASSWORD, 7) as hash_prefix
FROM USERS 
ORDER BY USERNAME; 