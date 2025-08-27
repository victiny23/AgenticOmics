-- Fix team membership requests constraint
ALTER TABLE team_membership_requests DROP CONSTRAINT IF EXISTS CONSTRAINT_D;
ALTER TABLE team_membership_requests ADD CONSTRAINT team_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'));

-- Fix lab membership requests constraint
ALTER TABLE lab_membership_requests DROP CONSTRAINT IF EXISTS CONSTRAINT_C;
ALTER TABLE lab_membership_requests ADD CONSTRAINT lab_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'));
