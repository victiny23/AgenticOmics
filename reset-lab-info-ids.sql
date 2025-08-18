-- Reset LAB_INFO table IDs to start from 1 and auto-increment
-- This script will properly reset the ID sequence and update existing records

-- Step 1: Check current state
SELECT 'Current LAB_INFO table state:' as info;
SELECT ID, LAB_ID, LAB_NAME FROM LAB_INFO ORDER BY ID;

-- Step 2: Create a temporary table to store the data
CREATE TEMP TABLE LAB_INFO_TEMP AS 
SELECT LAB_ID, LAB_NAME, IS_ACTIVE, CREATED_AT, UPDATED_AT 
FROM LAB_INFO;

-- Step 3: Delete all records from LAB_INFO (this will reset the auto-increment)
DELETE FROM LAB_INFO;

-- Step 4: Reset the auto-increment sequence to start from 1
ALTER TABLE LAB_INFO ALTER COLUMN ID RESTART WITH 1;

-- Step 5: Re-insert the data (this will get new auto-incremented IDs starting from 1)
INSERT INTO LAB_INFO (LAB_ID, LAB_NAME, IS_ACTIVE, CREATED_AT, UPDATED_AT)
SELECT LAB_ID, LAB_NAME, IS_ACTIVE, CREATED_AT, UPDATED_AT
FROM LAB_INFO_TEMP
ORDER BY LAB_ID;

-- Step 6: Update LAB_IDs to match the new sequential IDs
UPDATE LAB_INFO 
SET LAB_ID = CONCAT('LAB', LPAD(ID, 3, '0'))
WHERE ID > 0;

-- Step 7: Drop the temporary table
DROP TABLE LAB_INFO_TEMP;

-- Step 8: Verify the results
SELECT 'Final LAB_INFO table state:' as info;
SELECT ID, LAB_ID, LAB_NAME FROM LAB_INFO ORDER BY ID;

-- Step 9: Check if any foreign key references need updating
SELECT 'Checking USER_LAB_MEMBERSHIPS that reference LAB_INFO:' as info;
SELECT ulm.ID, ulm.LAB_ID, l.LAB_NAME 
FROM USER_LAB_MEMBERSHIPS ulm
LEFT JOIN LAB_INFO l ON ulm.LAB_ID = l.ID
ORDER BY ulm.ID; 