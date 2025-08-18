-- Change Admin Password to a Secure One
-- This script changes the admin password from 'admin' to a more secure password

-- Option 1: Change to a specific secure password (recommended)
-- Replace 'YourSecurePassword123!' with your desired password
-- The hash below is for 'YourSecurePassword123!' - CHANGE THIS!
UPDATE USERS 
SET PASSWORD = '$2y$10$xr7tIvjo6Dh2jwLXaUu1eeYXJ8VMd870k3JSbSD3l/fGM63RV2KH.' 
WHERE USERNAME = 'admin';

-- Option 2: If you want to use a different password, you'll need to generate a new BCrypt hash
-- You can use online BCrypt generators or generate it programmatically

-- Verify the change
SELECT USERNAME, EMAIL, ROLE, IS_ACTIVE FROM USERS WHERE USERNAME = 'admin'; 