-- Restore Users Script - Restoring Jerry, Mian, Gabriel, and Admin
-- This script restores all the users that were accidentally deleted

-- Create Jerry user
INSERT INTO users (username, password, email, role, is_active, created_at, updated_at) 
VALUES ('Jerry', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'jerry@test.com', 'Lab PI', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create Mian user
INSERT INTO users (username, password, email, role, is_active, created_at, updated_at) 
VALUES ('Mian', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'aureliaaa615@gmail.com', 'Master Student', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create Gabriel user
INSERT INTO users (username, password, email, role, is_active, created_at, updated_at) 
VALUES ('Gabriel', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '123456@qq.com', 'Master Student', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create Admin user
INSERT INTO users (username, password, email, role, is_active, created_at, updated_at) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'admin@agenticomics.com', 'Super Admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create LAB001
INSERT INTO lab_info (lab_id, lab_name, lab_description, institution, department, is_active, created_at, updated_at) 
VALUES ('LAB001', 'lab01', 'Advanced genomics and bioinformatics research', 'University of Science', 'Research Department', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create LAB002
INSERT INTO lab_info (lab_id, lab_name, lab_description, institution, department, is_active, created_at, updated_at) 
VALUES ('LAB002', 'Data Science Lab', 'Machine learning and data analysis research', 'University of Technology', 'Computer Science Department', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add Jerry as Lab PI of LAB001
INSERT INTO user_lab_memberships (user_id, lab_id, role_in_lab, member_id, is_primary_lab, is_active, joined_at, created_at, updated_at) 
SELECT 
    (SELECT id FROM users WHERE username = 'Jerry'),
    (SELECT id FROM lab_info WHERE lab_id = 'LAB001'),
    'Lab PI',
    'PI001',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

-- Add Mian as member of LAB001
INSERT INTO user_lab_memberships (user_id, lab_id, role_in_lab, member_id, is_primary_lab, is_active, joined_at, created_at, updated_at) 
SELECT 
    (SELECT id FROM users WHERE username = 'Mian'),
    (SELECT id FROM lab_info WHERE lab_id = 'LAB001'),
    'Master Student',
    'MS001',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

-- Create TEAM001
INSERT INTO teams (team_id, team_name, team_description, lab_id, team_leader_id, is_active, created_at, updated_at) 
SELECT 
    'TEAM001', 
    'Research Team1', 
    'Genomic data analysis and bioinformatics', 
    (SELECT id FROM lab_info WHERE lab_id = 'LAB001'), 
    (SELECT id FROM users WHERE username = 'Jerry'), 
    true, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP;

-- Add Jerry as Team Leader of TEAM001
INSERT INTO user_team_memberships (user_id, team_id, role_in_team, member_id, is_primary_team, is_active, joined_at, created_at, updated_at) 
SELECT 
    (SELECT id FROM users WHERE username = 'Jerry'),
    (SELECT id FROM teams WHERE team_id = 'TEAM001'),
    'Team Leader',
    'TL001',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

-- Add Mian as member of TEAM001
INSERT INTO user_team_memberships (user_id, team_id, role_in_team, member_id, is_primary_team, is_active, joined_at, created_at, updated_at) 
SELECT 
    (SELECT id FROM users WHERE username = 'Mian'),
    (SELECT id FROM teams WHERE team_id = 'TEAM001'),
    'Team Member',
    'TM001',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;
