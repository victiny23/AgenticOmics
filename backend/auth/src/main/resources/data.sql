-- Clean up any existing empty telephone strings
UPDATE USERS SET TELEPHONE = NULL WHERE TELEPHONE = '';

-- Create admin user if it doesn't exist (using environment variables or default)
INSERT INTO USERS (USERNAME, PASSWORD, EMAIL, ROLE, IS_ACTIVE, CREATED_AT, UPDATED_AT) 
SELECT 
    COALESCE('${ADMIN_USERNAME:admin}', 'admin'), 
    COALESCE('${ADMIN_PASSWORD_HASH}', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa'), 
    COALESCE('${ADMIN_EMAIL:admin@agenticomics.com}', 'admin@agenticomics.com'), 
    'Super Admin', 
    true, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM USERS WHERE USERNAME = COALESCE('${ADMIN_USERNAME:admin}', 'admin'));

-- Update existing admin user to Super Admin role
UPDATE USERS SET ROLE = 'Super Admin' WHERE USERNAME = COALESCE('${ADMIN_USERNAME:admin}', 'admin');

-- Ensure admin is not a member of any lab or team (Super Admin should be independent)
DELETE FROM USER_LAB_MEMBERSHIPS WHERE USER_ID = (SELECT ID FROM USERS WHERE USERNAME = COALESCE('${ADMIN_USERNAME:admin}', 'admin'));
DELETE FROM USER_TEAM_MEMBERSHIPS WHERE USER_ID = (SELECT ID FROM USERS WHERE USERNAME = COALESCE('${ADMIN_USERNAME:admin}', 'admin')); 