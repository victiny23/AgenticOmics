-- Clean up any existing invitations for Gabriel to LAB001
DELETE FROM lab_invitations 
WHERE invited_user_id = (SELECT id FROM users WHERE username = 'Gabriel') 
AND lab_id = 1;

-- Also clean up any team invitations for Gabriel to any team in LAB001
DELETE FROM team_invitations 
WHERE invited_user_id = (SELECT id FROM users WHERE username = 'Gabriel') 
AND team_id IN (SELECT id FROM teams WHERE lab_id = 1);

-- Show remaining invitations for debugging
SELECT 'Lab Invitations:' as type, li.id, u.username as invited_user, l.lab_name, li.status, li.created_at
FROM lab_invitations li
JOIN users u ON li.invited_user_id = u.id
JOIN lab_info l ON li.lab_id = l.id
WHERE u.username = 'Gabriel';

SELECT 'Team Invitations:' as type, ti.id, u.username as invited_user, t.team_name, ti.status, ti.created_at
FROM team_invitations ti
JOIN users u ON ti.invited_user_id = u.id
JOIN teams t ON ti.team_id = t.id
WHERE u.username = 'Gabriel';
