# Frontend Context Validation Testing Guide

## Overview
The frontend now enforces that users must select a lab/team context before they can upload files. This guide explains how to test this functionality.

## Frontend Changes Implemented

### 1. **Context Validation in File Selection**
- Users cannot drag & drop or select files without choosing a context first
- Clear error message: "Please select a lab/team context before adding files"
- Success message when files are added with context

### 2. **Visual Feedback**
- Upload area changes appearance based on context selection:
  - **No Context**: Red border, warning message, disabled state
  - **Context Selected**: Normal blue border, shows context info

### 3. **Upload Area States**

#### When No Context is Selected:
- Red border (`#ff6b6b`)
- Light red background (`#fff5f5`)
- Cursor: `not-allowed`
- Opacity: 0.7
- Warning message: "⚠️ Lab/Team Context Required"
- Disabled file input

#### When Context is Selected:
- Normal blue border (`#1976d2`)
- Light blue background (`#f0f7ff`)
- Cursor: `pointer`
- Full opacity
- Shows: "📁 Uploading to: [Lab/Team Name] ([Type])"
- Enabled file input

### 4. **File Queue Management**
- Warning banner appears when files are in queue but no context is selected
- Upload buttons are disabled when no context is selected
- Context information is displayed in the file list header

## How to Test

### Test 1: No Context Selected
1. Go to the Data Upload page
2. **Don't** select any lab/team context
3. Try to drag & drop a file
4. **Expected**: Error message appears, file is not added to queue
5. Try to click the upload area to browse files
6. **Expected**: File dialog doesn't open (input is disabled)

### Test 2: Context Selected
1. Go to the Data Upload page
2. Select a lab or team context from the dropdown
3. Drag & drop a file
4. **Expected**: File is added to queue, success message appears
5. **Expected**: Upload area shows context information

### Test 3: Context Removed After Files Added
1. Add files to the queue with a context selected
2. Change the context to "None" or remove the context
3. **Expected**: Warning banner appears
4. **Expected**: Upload buttons become disabled
5. **Expected**: Clear message about context requirement

### Test 4: Upload Button States
1. Add files to the queue without context
2. **Expected**: Upload buttons are disabled with tooltip
3. Select a context
4. **Expected**: Upload buttons become enabled

## Backend Validation (When Authentication is Fixed)

### Context Validation Rules:
1. **Upload Context Required**: Must be "LAB" or "TEAM"
2. **Lab Context**: Requires `labId` and `labName`
3. **Team Context**: Requires `teamId` and `teamName`
4. **Access Control**: User must be a member of the selected lab/team

### Error Messages:
- "Upload context is required. Please select a lab or team context."
- "Lab ID and Lab Name are required when uploading to lab context."
- "Team ID and Team Name are required when uploading to team context."
- "Invalid upload context. Must be either 'LAB' or 'TEAM'."
- "You don't have permission to upload files to this context."

## Files Modified

### Frontend:
- `frontend/web-app/src/components/DataUpload/DataUploadComponent.tsx`
  - Enhanced `onDrop` callback with context validation
  - Updated upload area with conditional styling
  - Added context warning banner
  - Disabled upload buttons without context
  - Added context information display

### Backend:
- `backend/data-management/src/main/java/com/agenticomics/datamanagement/service/DataFileService.java`
  - Added context validation in `uploadFile` method
  - Added `validateUserContextAccess` method
  - Enhanced error handling for missing context

## Result
Users can no longer upload files without selecting a lab/team context, ensuring proper file organization and access control. 