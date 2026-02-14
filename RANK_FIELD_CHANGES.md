# Employee Rank Field Implementation

## Summary
Added an optional `rank` field to employee records to track employee seniority levels.

## Changes Made

### 1. Shared Package (`shared/`)
- **Types** (`src/types/index.ts`):
  - Added `rank` field to `IEmployee` interface
  - Type: `'junior' | 'mid' | 'senior' | 'manager' | 'lead' | 'ceo'`

- **Validators** (`src/validators/index.ts`):
  - Added `employeeRankSchema` with enum values: `['junior', 'mid', 'senior', 'manager', 'lead', 'ceo']`
  - Updated `createEmployeeSchema` to include optional `rank` field
  - Updated `updateEmployeeSchema` to include optional `rank` field

### 2. Employee Service (`services/employees/`)
- **Model** (`src/models/employee.model.ts`):
  - Added `rank` field to employee schema
  - Type: String with enum constraint

- **Service DTO** (`src/services/employee.service.ts`):
  - Updated `CreateEmployeeDTO` to include optional `rank` field

- **Controller** (`src/controllers/employee.controller.ts`):
  - Updated `create` method to handle `rank` field
  - Updated `update` method to handle `rank` field

- **Tests** (`src/__tests__/services/employee.service.test.ts`):
  - Added test: "should create an employee with rank"
  - Added test: "should update employee rank"

## API Usage

### Create Employee with Rank
```bash
POST /api/v1/employees
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "job_title": "Senior Engineer",
  "rank": "senior",  // Optional: junior, mid, senior, manager, lead, ceo
  "department_id": "507f1f77bcf86cd799439011"
}
```

### Update Employee Rank
```bash
PUT /api/v1/employees/:id
{
  "rank": "lead"  // Optional
}
```

## Validation
- The `rank` field is **optional** for both create and update operations
- Valid values: `junior`, `mid`, `senior`, `manager`, `lead`, `ceo`
- Invalid rank values will return a 422 Validation Error

## Test Results
✅ All 15 tests passing
- Employee creation with rank
- Employee rank updates
- All existing functionality preserved

## Migration Notes
- This is a **non-breaking change** - the field is optional
- Existing employees will have `rank: undefined`
- No database migration required
