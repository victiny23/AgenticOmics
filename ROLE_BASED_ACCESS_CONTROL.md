# Role-Based Access Control in User Management

## Overview

This feature implements role-based access control in the User Management page, ensuring that:

1. **Regular members** (like Mian) can only see members in their own lab/team
2. **PIs and Team Leaders** can see all users but organized by their organizations
3. **Jerry** (who is PI of multiple labs) can see users grouped by organization with clear visibility of his multiple roles

## Implementation Details

### Backend Changes

#### 1. New API Endpoint
- **Endpoint**: `GET /api/auth/admin/users/all-with-organizations`
- **Purpose**: Returns all users with their complete organization information
- **Access**: Only available to Lab PIs and Team Leaders
- **Response**: Includes user details plus lab and team memberships

#### 2. UserService Enhancement
- **Method**: `getAllUsersWithOrganizations()`
- **Functionality**: Fetches all users and enriches them with:
  - Lab memberships (lab name, code, role, primary status)
  - Team memberships (team name, code, role, primary status)
  - User details (username, email, role, status, etc.)

#### 3. API Gateway Configuration
- **Updated**: `JwtAuthenticationFilter.java`
- **Added**: Route for `/api/auth/admin/users/all-with-organizations`
- **Security**: Maintains existing authentication and authorization

### Frontend Changes

#### 1. UserManagementPage.tsx Enhancements
- **Role Detection**: Automatically detects if user is PI/Team Leader
- **Conditional Display**: Shows different views based on user role
- **Organization Grouping**: Displays users with their lab/team memberships

#### 2. Navigation Updates
- **Added**: "User Management" to main navigation menu
- **Accessible**: Now available to all authenticated users
- **Description**: "Manage memberships and applications"

#### 3. LabHierarchy.tsx Integration
- **Added**: "Organization Management" section
- **Buttons**: "Apply to Join Lab" and "My Applications"
- **Purpose**: Provides easy access to application features

## User Experience

### For Regular Members (e.g., Mian)

#### What They See:
- **Simple Table**: List of users in their lab/team only
- **Limited Actions**: View details only (no admin actions)
- **Organization Tab**: Shows their own memberships
- **Application Access**: Can apply to join labs and view their applications

#### Access Restrictions:
- Cannot see users outside their lab/team
- Cannot access admin endpoints
- Cannot deactivate/activate users
- Cannot view all users in the system

### For PIs and Team Leaders (e.g., Jerry)

#### What They See:
- **Rich User Cards**: Each user displayed with full organization info
- **Lab Memberships**: Clear display of all lab affiliations
- **Team Memberships**: Clear display of all team affiliations
- **Primary Indicators**: Shows which lab/team is primary
- **Admin Actions**: Can activate/deactivate users

#### Organization Display:
```
Jerry (Lab PI)
├── Lab Memberships:
│   ├── LAB001 (Omics Research Lab) - Lab PI (Primary)
│   └── LAB002 (Bioinformatics Lab) - Lab PI
└── Team Memberships:
    └── TEAM001 (Alpha Team) - Team Leader (Primary)
```

## Technical Architecture

### Role Detection Logic
```typescript
const isPI = userMemberships.labMemberships.some(m => 
  m.roleInLab === 'Lab PI' && m.isActive
);
const isTeamLeader = userMemberships.teamMemberships.some(m => 
  m.roleInTeam === 'Team Leader' && m.isActive
);
const isPIOrLeader = isPI || isTeamLeader;
```

### API Call Strategy
```typescript
if (isPIOrLeader) {
  // Fetch all users with organization info
  response = await fetch('/api/auth/admin/users/all-with-organizations');
} else {
  // Fetch only lab members
  response = await fetch('/api/auth/labs/my-lab-members');
}
```

### Data Structure
```json
{
  "users": [
    {
      "id": 1,
      "username": "Jerry",
      "email": "jerry@example.com",
      "role": "Lab PI",
      "isActive": true,
      "labMemberships": [
        {
          "labId": 1,
          "labName": "Omics Research Lab",
          "labCode": "LAB001",
          "roleInLab": "Lab PI",
          "isPrimaryLab": true
        }
      ],
      "teamMemberships": [
        {
          "teamId": 1,
          "teamName": "Alpha Team",
          "teamIdCode": "TEAM001",
          "roleInTeam": "Team Leader",
          "isPrimaryTeam": true
        }
      ]
    }
  ]
}
```

## Security Considerations

### Access Control
- **Regular Members**: Restricted to lab/team members only
- **PIs/Team Leaders**: Full access to all users with organization context
- **API Endpoints**: Protected by role-based authorization

### Data Privacy
- Users cannot see information about users outside their organization
- PI access is limited to users they have authority over
- Sensitive user information is properly filtered

## Testing

### Test Script
- **File**: `test-role-based-access.sh`
- **Purpose**: Automated testing of role-based access control
- **Tests**:
  1. Regular member access (Mian)
  2. PI access (Jerry)
  3. Organization grouping
  4. Access restrictions

### Manual Testing
1. **Login as Mian**: Verify limited access to lab members only
2. **Login as Jerry**: Verify full access with organization grouping
3. **Check Navigation**: Verify "User Management" is accessible
4. **Test Applications**: Verify application features work for both roles

## Benefits

### For Regular Members
- **Focused View**: Only see relevant users in their organization
- **Reduced Complexity**: Simplified interface without admin features
- **Clear Context**: Understand their role within their lab/team

### For PIs and Team Leaders
- **Complete Overview**: See all users with organization context
- **Multi-Lab Visibility**: Clear view of users across multiple labs
- **Efficient Management**: Easy identification of user roles and memberships
- **Better Decision Making**: Full context for user management decisions

### For System Administrators
- **Scalable Design**: Role-based access scales with organization size
- **Security**: Proper access control prevents unauthorized data access
- **Maintainable**: Clear separation of concerns and responsibilities

## Future Enhancements

### Potential Improvements
1. **Advanced Filtering**: Filter users by lab, team, role, or status
2. **Bulk Operations**: Perform actions on multiple users at once
3. **Audit Logging**: Track user management actions
4. **Export Functionality**: Export user lists with organization data
5. **Search and Sort**: Advanced search and sorting capabilities

### Integration Opportunities
1. **Dashboard Integration**: Show organization statistics on main dashboard
2. **Notification System**: Notify PIs of new applications or membership changes
3. **Reporting**: Generate reports on lab/team composition and growth
4. **Analytics**: Track membership trends and organization evolution 