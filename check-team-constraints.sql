-- Check current constraints on team_membership_requests table
SELECT CONSTRAINT_NAME, CHECK_CLAUSE 
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'PUBLIC' 
AND CONSTRAINT_NAME LIKE '%TEAM_MEMBERSHIP%';

-- Check the current status values in the table
SELECT DISTINCT status FROM team_membership_requests;

-- Drop the problematic constraint if it exists
ALTER TABLE team_membership_requests DROP CONSTRAINT IF EXISTS CONSTRAINT_D;

-- Add a new constraint that includes WITHDRAWN
ALTER TABLE team_membership_requests ADD CONSTRAINT status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'));
