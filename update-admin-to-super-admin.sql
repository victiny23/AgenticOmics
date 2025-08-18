-- Update Admin to Super Admin and Remove Lab/Team Memberships
-- This script ensures the admin user has full system access without being part of any organization

-- 1. Update admin role to Super Admin
UPDATE USERS 
SET ROLE = 'Super Admin' 
WHERE USERNAME = 'admin';

-- 2. Remove admin from any lab memberships (Super Admin should be independent)
DELETE FROM USER_LAB_MEMBERSHIPS 
WHERE USER_ID = (SELECT ID FROM USERS WHERE USERNAME = 'admin');

-- 3. Remove admin from any team memberships (Super Admin should be independent)
DELETE FROM USER_TEAM_MEMBERSHIPS 
WHERE USER_ID = (SELECT ID FROM USERS WHERE USERNAME = 'admin');

-- 4. Verify the changes
SELECT 'Admin User Status:' as info;
SELECT ID, USERNAME, ROLE, IS_ACTIVE FROM USERS WHERE USERNAME = 'admin';

SELECT 'Admin Lab Memberships (should be empty):' as info;
SELECT COUNT(*) as lab_memberships FROM USER_LAB_MEMBERSHIPS 
WHERE USER_ID = (SELECT ID FROM USERS WHERE USERNAME = 'admin');

SELECT 'Admin Team Memberships (should be empty):' as info;
SELECT COUNT(*) as team_memberships FROM USER_TEAM_MEMBERSHIPS 
WHERE USER_ID = (SELECT ID FROM USERS WHERE USERNAME = 'admin');

SELECT 'Super Admin Implementation Complete!' as status; 