import { generateInvitationCode, isValidInvitationCode } from './code-generator';

describe('Invitation code generator utility', () => {
    it('the code length should be 9 characters including the hyphen', () => {
        const code = generateInvitationCode();
        expect(code).toHaveLength(9);
    });
    it('the fifth character should be a hyphen', () => {
        const code = generateInvitationCode();
        expect(code[4]).toBe('-');
    });
    it('the code does not have ambiguous characters (0, O, 1, I)', () => {
        expect.assertions(100);
        for(let i = 0; i < 100; i++) {
            const code = generateInvitationCode();
            expect(code).not.toMatch(/[01OI]/);
        }
    });
});

describe('Code Validation Utility', () => {
    it('should return the correct format for a valid code', () => {
        const validCode = 'AB3X-9K2M';
        expect(isValidInvitationCode(validCode)).toBe(true);
    });
    it('should return false for lowercase letters', () => {
        const invalidCode = 'ab3x-9k2m';
        expect(isValidInvitationCode(invalidCode)).toBe(false);
    });
    it('should return false for missing dash', () => {
        const invalidCode = 'AB3X9K2M';
        expect(isValidInvitationCode(invalidCode)).toBe(false);
    });
    it('should return false if the code contains ambiguous characters (0, O, 1, I)', () => {
        const invalidCode = 'AB3O-9K2M';
        expect(isValidInvitationCode(invalidCode)).toBe(false);
    });
    it('should return false if the code is too long or too short', () => {
        const invalidCode = 'AB3-9K2M';
        expect(isValidInvitationCode(invalidCode)).toBe(false);
    });
    it('should return false if the code comes as an empty string', () => {
        const invalidCode = '';
        expect(isValidInvitationCode(invalidCode)).toBe(false);
    });
    it('a generated code passes the validation check', () => {
        for(let i = 0; i < 100; i++) {
            const code = generateInvitationCode();
            expect(isValidInvitationCode(code)).toBe(true);
        }
    });
});