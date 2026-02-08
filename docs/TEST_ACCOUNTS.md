# Test Accounts

This document lists the test accounts available for development and testing purposes.

## Available Test Accounts

All test accounts use the password: `password123`

| Email | Role | Password | Purpose |
|-------|------|----------|---------|
| admin@example.com | admin | password123 | Full system administration access |
| hr@example.com | hr | password123 | HR management functions |
| manager@example.com | manager | password123 | Team management and reviews |
| csuite@example.com | csuite | csuite123 | C-suite executive access |
| employee@example.com | employee | password123 | Standard employee access |

## Role Permissions

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations across all services

### HR
- Employee management
- Department management
- Review cycle management
- Access to all employee data and analytics

### Manager
- Manage direct reports
- Create and manage goals for team members
- Conduct performance reviews
- View team analytics

### C-Suite
- View organization-wide analytics
- Access to all reports and dashboards
- Read-only access to most resources

### Employee
- View and update own profile
- Manage own goals
- Submit self-reviews
- View own performance data

## Creating Additional Test Accounts

To create additional test users, use the seeding script:

```bash
bun run scripts/seed-users.ts
```

Or modify the script to add custom users with different roles and credentials.

## Security Note

**⚠️ WARNING**: These are test accounts for development only. 
- Never use these credentials in production
- Change all default passwords before deploying to any environment
- Ensure proper authentication and authorization are configured for production use
