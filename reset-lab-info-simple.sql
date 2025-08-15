-- Simple Reset LAB_INFO table IDs to start from 1
-- This approach preserves foreign key relationships

-- Step 1: Check current state
SELECT 'Current LAB_INFO table state:' as info;
SELECT ID, LAB_ID, LAB_NAME FROM LAB_INFO ORDER BY ID;

-- Step 2: Update existing records to have sequential IDs starting from 1
-- First, let's see what we have
SELECT 'Current IDs:' as info;
SELECT ID, LAB_ID, LAB_NAME FROM LAB_INFO ORDER BY ID;

-- Step 3: Update IDs to be sequential starting from 1
-- We'll do this carefully to avoid conflicts
UPDATE LAB_INFO SET ID = 1 WHERE LAB_ID = 'LAB001';
UPDATE LAB_INFO SET ID = 2 WHERE LAB_ID = 'LAB002' AND ID != 1;
UPDATE LAB_INFO SET ID = 3 WHERE LAB_ID = 'LAB003' AND ID != 1 AND ID != 2;

-- Step 4: Reset the auto-increment sequence
ALTER TABLE LAB_INFO ALTER COLUMN ID RESTART WITH 4;

-- Step 5: Verify the results
SELECT 'Final LAB_INFO table state:' as info;
SELECT ID, LAB_ID, LAB_NAME FROM LAB_INFO ORDER BY ID;

-- Step 6: Check foreign key relationships
SELECT 'USER_LAB_MEMBERSHIPS with LAB references:' as info;
SELECT ulm.ID, ulm.LAB_ID, l.LAB_NAME, l.ID as LAB_INFO_ID
FROM USER_LAB_MEMBERSHIPS ulm
LEFT JOIN LAB_INFO l ON ulm.LAB_ID = l.ID
ORDER BY ulm.ID; 