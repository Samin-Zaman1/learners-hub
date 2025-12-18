/**
 * Utility to generate unique invitation codes for courses
 */

/**
 * Generates a random 8-character alphanumeric code
 * Format: XXXX-XXXX (e.g., AB3X-9K2M)
 */
export function generateInvitationCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars: 0,O,1,I
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    if (i === 4) {
      code += '-'; // Add separator in middle
    }
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

/**
 * Validates invitation code format
 */
export function isValidInvitationCode(code: string): boolean {
  // Format: XXXX-XXXX
  const pattern = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
  return pattern.test(code);
}
