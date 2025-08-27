-- Fix database constraints to allow WITHDRAWN status for membership requests
-- This script updates the check constraints to include the new WITHDRAWN status

-- Drop existing constraints and recreate them with WITHDRAWN status
ALTER TABLE team_membership_requests DROP CONSTRAINT IF EXISTS CONSTRAINT_D;
ALTER TABLE lab_membership_requests DROP CONSTRAINT IF EXISTS CONSTRAINT_D;

-- Add new constraints that include WITHDRAWN status
ALTER TABLE team_membership_requests ADD CONSTRAINT team_membership_requests_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'));

ALTER TABLE lab_membership_requests ADD CONSTRAINT lab_membership_requests_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'));

-- Verify the changes
SELECT 'Team membership requests constraint updated' as message;
SELECT 'Lab membership requests constraint updated' as message;
