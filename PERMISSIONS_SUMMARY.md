# User Permissions Summary

## User Roles and Permissions

### 1. Admin (`admin@gmail.com` / PIN: `1234`)
**Full Access - Can do everything:**
- ✅ View all pages and data
- ✅ Create, edit, and delete journal entries
- ✅ Create, edit, and delete accounts
- ✅ Create, edit, and delete account types
- ✅ Manage users (create, edit, delete, set permissions)
- ✅ Access User Management page
- ✅ Export and print all reports
- ✅ All accounting operations

### 2. Accountant (`accountant@gmail.com` / PIN: `5678`)
**Can view and edit accounting data:**
- ✅ View all pages and data
- ✅ Create, edit, and delete journal entries
- ✅ Create, edit, and delete accounts
- ✅ Create, edit, and delete account types
- ❌ Cannot manage users
- ❌ Cannot access User Management page
- ✅ Export and print all reports
- ✅ All accounting operations

### 3. User (`user@gmail.com` / PIN: `9012`)
**View only - Cannot edit:**
- ✅ View all pages and data
- ❌ Cannot create, edit, or delete journal entries
- ❌ Cannot create, edit, or delete accounts
- ❌ Cannot create, edit, or delete account types
- ❌ Cannot manage users
- ❌ Cannot access User Management page
- ✅ Can export and print reports (read-only access)

## Permission Checks Implemented

### Journal Entries
- ✅ "New Entry" button - Hidden for non-admin/accountant users
- ✅ Edit button - Hidden for non-admin/accountant users
- ✅ Delete button - Hidden for non-admin/accountant users
- ✅ Reverse button - Hidden for non-admin/accountant users
- ✅ Edit page - Protected route, redirects if not admin/accountant
- ✅ Created By column - Shows user who created each entry

### Chart of Accounts
- ✅ "Add Account" button - Hidden for non-admin/accountant users
- ✅ "Add Sub-Account" button - Hidden for non-admin/accountant users
- ✅ Edit account button - Hidden for non-admin/accountant users
- ✅ Delete account button - Hidden for non-admin/accountant users
- ✅ "Add Account Type" button - Hidden for non-admin/accountant users
- ✅ Edit account type button - Hidden for non-admin/accountant users
- ✅ Delete account type button - Hidden for non-admin/accountant users

### User Management
- ✅ User Management page - Only accessible to admin
- ✅ "Users" link in navigation - Only visible to admin
- ✅ Create user - Admin only
- ✅ Edit user - Admin only
- ✅ Delete user - Admin only
- ✅ Set user permissions - Admin only

### Navigation
- ✅ User selector - Shows current user
- ✅ Logout button - Available to all authenticated users
- ✅ User Management link - Only visible to admin

### Authentication
- ✅ Login required for all pages (except `/login`)
- ✅ Email and PIN authentication
- ✅ Session stored in localStorage
- ✅ Auto-redirect to login if not authenticated

## Permission Functions

### `canEdit(user)` 
- Returns `true` for admin and accountant
- Returns `false` for regular users
- Used for accounting data operations

### `canEditUsers(user)`
- Returns `true` only for admin
- Returns `false` for accountant and regular users
- Used for user management operations

### `isAdmin(user)`
- Returns `true` only for admin
- Used for admin-only features

### `canView(user)`
- Returns `true` for all authenticated users
- Used for view permissions

## Testing Checklist

### Admin User
- [ ] Login with `admin@gmail.com` / `1234`
- [ ] Can see "Users" link in navigation
- [ ] Can access User Management page
- [ ] Can create/edit/delete users
- [ ] Can create/edit/delete journal entries
- [ ] Can create/edit/delete accounts
- [ ] Can see all edit buttons

### Accountant User
- [ ] Login with `accountant@gmail.com` / `5678`
- [ ] Cannot see "Users" link in navigation
- [ ] Cannot access User Management page (redirects)
- [ ] Can create/edit/delete journal entries
- [ ] Can create/edit/delete accounts
- [ ] Can see edit buttons for accounting data

### Regular User
- [ ] Login with `user@gmail.com` / `9012`
- [ ] Cannot see "Users" link in navigation
- [ ] Cannot access User Management page (redirects)
- [ ] Cannot see "New Entry" button
- [ ] Cannot see edit/delete buttons
- [ ] Can view all data
- [ ] Can export/print reports




