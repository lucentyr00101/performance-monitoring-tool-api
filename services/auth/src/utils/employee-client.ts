const LOG_PREFIX = '[EmployeeClient]';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:4002';

export interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  position: string | null;
  hireDate: string | null;
  managerId: string | null;
}

/**
 * Fetch full employee data from the Employee service by employee ID.
 * Returns null if the employee is not found or the service is unavailable.
 */
export async function fetchEmployeeById(
  employeeId: string,
  authHeader?: string,
): Promise<EmployeeData | null> {
  const url = `${EMPLOYEE_SERVICE_URL}/api/v1/employees/${employeeId}`;
  const startTime = Date.now();

  console.info(`${LOG_PREFIX} Fetching employee`, { employeeId, url });

  try {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, { headers });
    const duration = Date.now() - startTime;

    if (!response.ok) {
      console.warn(`${LOG_PREFIX} Employee fetch failed`, {
        employeeId,
        status: response.status,
        duration,
      });
      return null;
    }

    const body = await response.json() as {
      success: boolean;
      data?: {
        _id?: string;
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        jobTitle?: string;
        departmentId?: { name?: string } | string;
        managerId?: string;
        hireDate?: string;
      };
    };

    if (!body.success || !body.data) {
      console.warn(`${LOG_PREFIX} Employee response invalid`, { employeeId, duration });
      return null;
    }

    const emp = body.data;
    const departmentName =
      typeof emp.departmentId === 'object' && emp.departmentId !== null
        ? emp.departmentId.name ?? null
        : null;

    console.info(`${LOG_PREFIX} Employee fetched successfully`, { employeeId, duration });

    return {
      id: emp._id?.toString() ?? emp.id ?? employeeId,
      firstName: emp.firstName ?? '',
      lastName: emp.lastName ?? '',
      email: emp.email ?? '',
      department: departmentName,
      position: emp.jobTitle ?? null,
      hireDate: emp.hireDate ?? null,
      managerId: emp.managerId?.toString() ?? null,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} Employee fetch error`, {
      employeeId,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
    return null;
  }
}
