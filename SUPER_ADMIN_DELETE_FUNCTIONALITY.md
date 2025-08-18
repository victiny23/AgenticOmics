# Super Admin Delete Functionality

## Overview

The Super Admin now has the ability to delete users, labs, and teams from the system. This functionality is restricted to users with the "Super Admin" role and includes proper safeguards to prevent accidental deletions.

## Features

### 🔴 User Deletion
- **Endpoint**: `DELETE /api/auth/admin/system/users/{userId}`
- **Access**: Super Admin only
- **Safeguards**: 
  - Cannot delete Super Admin users
  - Requires confirmation dialog
  - Cascading deletion of memberships
- **Frontend**: Delete button (🗑️) next to each non-Super Admin user

### 🧪 Lab Deletion
- **Endpoint**: `DELETE /api/auth/admin/system/labs/{labId}`
- **Access**: Super Admin only
- **Cascading Effects**:
  - Deletes all teams within the lab
  - Removes all lab memberships
  - Removes all team memberships for teams in the lab
- **Frontend**: Delete button (🗑️) on each lab card

### 👥 Team Deletion
- **Endpoint**: `DELETE /api/auth/admin/system/teams/{teamId}`
- **Access**: Super Admin only
- **Cascading Effects**:
  - Removes all team memberships
- **Frontend**: Delete button (🗑️) on each team card

## Backend Implementation

### New Endpoints Added

```java
// UserController.java
@DeleteMapping("/admin/system/users/{userId}")
public ResponseEntity<?> deleteUser(@PathVariable Long userId, @RequestHeader("X-Username") String username)

@DeleteMapping("/admin/system/labs/{labId}")
public ResponseEntity<?> deleteLab(@PathVariable Long labId, @RequestHeader("X-Username") String username)

@DeleteMapping("/admin/system/teams/{teamId}")
public ResponseEntity<?> deleteTeam(@PathVariable Long teamId, @RequestHeader("X-Username") String username)
```

### Service Methods

```java
// UserService.java
public boolean deleteUserById(Long userId)
public boolean deleteLabById(Long labId)
public boolean deleteTeamById(Long teamId)
```

### Repository Methods Added

```java
// UserLabMembershipRepository.java
void deleteByUserId(Long userId);
void deleteByLabId(Long labId);

// UserTeamMembershipRepository.java
void deleteByUserId(Long userId);
void deleteByTeamId(Long teamId);

// TeamRepository.java
void deleteByLabId(Long labId);
```

## Frontend Implementation

### SystemAdministrationPage.tsx

Added delete functions with confirmation dialogs:

```typescript
const deleteUser = async (userId: number) => {
  if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  // ... deletion logic
};

const deleteLab = async (labId: number) => {
  if (!window.confirm('Are you sure you want to delete this lab? This will also delete all teams in this lab and remove all memberships. This action cannot be undone.')) {
    return;
  }
  // ... deletion logic
};

const deleteTeam = async (teamId: number) => {
  if (!window.confirm('Are you sure you want to delete this team? This will remove all team memberships. This action cannot be undone.')) {
    return;
  }
  // ... deletion logic
};
```

### UI Components Updated

- **AllUsersTab**: Added delete button for each non-Super Admin user
- **AllLabsTab**: Added delete button for each lab
- **AllTeamsTab**: Added delete button for each team

## Security Features

### 1. Role-Based Access Control
- Only users with "Super Admin" role can access delete endpoints
- Non-Super Admin users receive "Access denied" response

### 2. Super Admin Protection
- Super Admin users cannot be deleted by other Super Admins
- Prevents system from being left without administrators

### 3. Confirmation Dialogs
- All delete operations require user confirmation
- Clear warnings about cascading effects

### 4. Cascading Deletion
- Proper cleanup of related data
- Prevents orphaned records

## API Gateway Configuration

The API Gateway already allows `/api/auth/admin/system/` endpoints, so no additional configuration is needed.

## Testing

### Test Script
Run the test script to verify functionality:

```bash
./test-super-admin-delete.sh
```

### Manual Testing Steps

1. **Login as Super Admin**:
   ```bash
   curl -X POST "http://localhost:12001/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Yangxingmian123#"}'
   ```

2. **Delete a User**:
   ```bash
   curl -X DELETE "http://localhost:12001/api/auth/admin/system/users/{userId}" \
     -H "X-Username: admin" \
     -H "Authorization: Bearer {token}"
   ```

3. **Delete a Lab**:
   ```bash
   curl -X DELETE "http://localhost:12001/api/auth/admin/system/labs/{labId}" \
     -H "X-Username: admin" \
     -H "Authorization: Bearer {token}"
   ```

4. **Delete a Team**:
   ```bash
   curl -X DELETE "http://localhost:12001/api/auth/admin/system/teams/{teamId}" \
     -H "X-Username: admin" \
     -H "Authorization: Bearer {token}"
   ```

## Error Handling

### Common Error Responses

- **403 Forbidden**: User is not a Super Admin
- **404 Not Found**: User/Lab/Team not found
- **400 Bad Request**: Cannot delete Super Admin user
- **500 Internal Server Error**: Database or server error

### Frontend Error Handling

- Displays error messages in alert dialogs
- Logs errors to console for debugging
- Reloads data after successful deletions

## Usage Instructions

### For Super Admin Users

1. **Access System Administration**:
   - Login with Super Admin account
   - Navigate to "System Administration" in the sidebar

2. **Delete Users**:
   - Go to "All Users" tab
   - Click the delete button (🗑️) next to any non-Super Admin user
   - Confirm the deletion

3. **Delete Labs**:
   - Go to "All Labs" tab
   - Click the delete button (🗑️) on any lab card
   - Confirm the deletion (includes warning about cascading effects)

4. **Delete Teams**:
   - Go to "All Teams" tab
   - Click the delete button (🗑️) on any team card
   - Confirm the deletion

### Safety Guidelines

1. **Always review before deleting**: Check the confirmation dialog details
2. **Understand cascading effects**: Lab deletion affects all teams and memberships
3. **Backup important data**: Consider exporting data before bulk deletions
4. **Test in development**: Verify deletion behavior in test environment first

## Future Enhancements

### Potential Improvements

1. **Soft Delete**: Implement soft delete with recovery options
2. **Bulk Operations**: Allow multiple selections for batch deletion
3. **Audit Trail**: Log all deletion operations for accountability
4. **Recovery Options**: Implement undo functionality for recent deletions
5. **Export Before Delete**: Automatically export data before deletion

### Monitoring and Alerts

1. **Deletion Notifications**: Email notifications for critical deletions
2. **Usage Analytics**: Track deletion patterns and frequency
3. **Rate Limiting**: Prevent rapid successive deletions

## Troubleshooting

### Common Issues

1. **"Access denied" errors**: Ensure user has Super Admin role
2. **"Cannot delete Super Admin"**: This is by design for system protection
3. **Cascading deletion failures**: Check database constraints and foreign keys
4. **Frontend not updating**: Refresh the page or check network requests

### Debug Steps

1. Check user role in database
2. Verify JWT token validity
3. Check API Gateway logs
4. Review Auth Service logs
5. Test endpoints directly with curl

## Conclusion

The Super Admin delete functionality provides comprehensive system management capabilities while maintaining security and data integrity. The implementation includes proper safeguards, user-friendly interfaces, and thorough error handling to ensure safe and reliable operation. 