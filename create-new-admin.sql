-- Create New Admin User with Correct Password
-- This creates a new admin user with password 'admin123'

INSERT INTO USERS (USERNAME, PASSWORD, EMAIL, ROLE, IS_ACTIVE, CREATED_AT, UPDATED_AT) 
VALUES ('admin2', '$2a$10$lGyNo/tYk6vVb7buQGWhzu4IYCC5wv0zAGYN.qJuKZyrlPBFNcLnW', 'admin2@agenticomics.com', 'Super Admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify the new user
SELECT USERNAME, EMAIL, ROLE, IS_ACTIVE FROM USERS WHERE USERNAME = 'admin2'; 