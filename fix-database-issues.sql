-- Fix Database Issues Script
-- 1. Reset LAB_INFO table IDs to start from 1
-- 2. Set up Jerry as Mian's supervisor (Mian already exists)

-- Step 1: Reset LAB_INFO table sequence to start from 1
ALTER TABLE LAB_INFO ALTER COLUMN ID RESTART WITH 1;

-- Step 2: Set Jerry as Mian's supervisor in the legacy supervisor field
UPDATE USERS 
SET SUPERVISOR_ID = (
    SELECT jerry.ID FROM USERS jerry WHERE jerry.USERNAME = 'Jerry'
)
WHERE USERNAME = 'Mian' 
  AND SUPERVISOR_ID IS NULL;

-- Step 3: Add Mian to LAB001 with Jerry as supervisor (if not already exists)
INSERT INTO USER_LAB_MEMBERSHIPS (USER_ID, LAB_ID, ROLE_IN_LAB, MEMBER_ID, SUPERVISOR_ID, IS_PRIMARY_LAB, IS_ACTIVE, CREATED_AT, UPDATED_AT, JOINED_AT)
SELECT 
    mian.ID,
    lab.ID,
    'PhD Student',
    'LAB001',
    jerry.ID,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM USERS mian, USERS jerry, LAB_INFO lab
WHERE mian.USERNAME = 'Mian' 
  AND jerry.USERNAME = 'Jerry'
  AND lab.LAB_ID = 'LAB001'
  AND NOT EXISTS (
    SELECT 1 FROM USER_LAB_MEMBERSHIPS ulm 
    WHERE ulm.USER_ID = mian.ID AND ulm.LAB_ID = lab.ID
  );

-- Step 4: Verify the changes
SELECT 'Users:' as info;
SELECT ID, USERNAME, ROLE, SUPERVISOR_ID FROM USERS WHERE USERNAME IN ('Jerry', 'Mian');

SELECT 'Lab Memberships:' as info;
SELECT 
    u.USERNAME,
    l.LAB_NAME,
    ulm.ROLE_IN_LAB,
    ulm.MEMBER_ID,
    s.USERNAME as SUPERVISOR_NAME,
    ulm.IS_PRIMARY_LAB
FROM USERS u
JOIN USER_LAB_MEMBERSHIPS ulm ON u.ID = ulm.USER_ID
JOIN LAB_INFO l ON ulm.LAB_ID = l.ID
LEFT JOIN USERS s ON ulm.SUPERVISOR_ID = s.ID
WHERE u.USERNAME IN ('Jerry', 'Mian')
ORDER BY u.USERNAME;

SELECT 'Lab Info IDs:' as info;
SELECT ID, LAB_ID, LAB_NAME FROM LAB_INFO ORDER BY ID; 