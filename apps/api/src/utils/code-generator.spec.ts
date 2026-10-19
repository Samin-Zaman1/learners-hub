import { isValidInvitationCode , generateInvitationCode } from './code-generator';

describe('generateInvitationCode', () => {
  it('should generate a valid invitation code', () => {
    const code = generateInvitationCode();
    expect(isValidInvitationCode(code)).toBe(true);
  });
  it('should generate code with correct length', () => {
    const code = generateInvitationCode();
    expect(code.length).toBe(9); // 8 characters + 1 hyphen
  });
  it('should generate codes a and b that are different', () => {
    const codeA = generateInvitationCode();
    const codeB = generateInvitationCode();
    expect(codeA).not.toBe(codeB);
  });
});

describe('isValidInvitationCode', () => {
    it('should return true for a valid invitation code', () => {
      const code = isValidInvitationCode('ABCD-EFGH');
      expect(code).toBe(true);
    });

    it('should return false for an invalid invitation code', () => {
      expect(isValidInvitationCode('INVALID-CODE')).toBe(false);        
    });
    it('should return false for a code that is too short', () => {
      expect(isValidInvitationCode('ABCD-EFG')).toBe(false);
    });
    it('should return false for a code that is too long', () => {
      expect(isValidInvitationCode('ABCDE-FGHI')).toBe(false);
    });
    it('should return false for a code with invalid characters', () => {
      expect(isValidInvitationCode('ABCD-1FGH')).toBe(false);
    });
    it('should return false for a code with lowercase letters', () => {
      expect(isValidInvitationCode('abcd-efgh')).toBe(false);
    });   
    it ('should return false for a code with special characters', () => {
      expect(isValidInvitationCode('ABCD-EF@H')).toBe(false);
    });
    it ('should return false for a code with spaces', () => {
      expect(isValidInvitationCode('ABCD EFGH')).toBe(false);
    });
    it('should return false for a code with missing hyphen', () => {
      expect(isValidInvitationCode('ABCDEFGH')).toBe(false);
    });
  });