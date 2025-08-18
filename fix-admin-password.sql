-- Fix Admin Password
-- This script corrects the admin password hash

-- Fix the password hash (remove the trailing dot)
UPDATE USERS 
SET PASSWORD = '$2y$10$xr7tIvjo6Dh2jwLXaUu1eeYXJ8VMd870k3JSbSD3l/fGM63RV2KH' 
WHERE USERNAME = 'admin';

-- Verify the change
SELECT USERNAME, EMAIL, ROLE, IS_ACTIVE FROM USERS WHERE USERNAME = 'admin'; 