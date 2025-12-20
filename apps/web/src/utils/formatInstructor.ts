/**
 * Format instructor name from API response
 * Handles both string format and object format from backend
 */
export function formatInstructorName(
  instructor: string | { 
    email: string; 
    firstName: string | null; 
    lastName: string | null; 
  }
): string {
  if (typeof instructor === 'string') {
    return instructor;
  }
  
  const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim();
  return fullName || instructor.email;
}
