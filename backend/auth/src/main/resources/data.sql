-- Clean up any existing empty telephone strings
UPDATE USERS SET TELEPHONE = NULL WHERE TELEPHONE = '';

-- Create admin user if it doesn't exist
INSERT INTO USERS (USERNAME, PASSWORD, EMAIL, ROLE, IS_ACTIVE, CREATED_AT, UPDATED_AT) 
SELECT 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'admin@agenticomics.com', 'Lab PI', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM USERS WHERE USERNAME = 'admin'); 