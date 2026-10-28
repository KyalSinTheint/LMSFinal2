/**
 * Password validation rules for KBZLIFE LMS
 *
 * Rules:
 * 1. At least 8 characters
 * 2. At least one uppercase letter (A–Z)
 * 3. At least one lowercase letter (a–z)
 * 4. At least one number (0–9)
 */

export interface PasswordRequirementItem {
  id: 'length' | 'uppercase' | 'lowercase' | 'number';
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  requirements: PasswordRequirementItem[];
  firstErrorMessage: string | null;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const requirements: PasswordRequirementItem[] = [
    {
      id: 'length',
      label: 'At least 8 characters.',
      met: hasMinLength,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A–Z).',
      met: hasUppercase,
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a–z).',
      met: hasLowercase,
    },
    {
      id: 'number',
      label: 'At least one number (0–9).',
      met: hasNumber,
    },
  ];

  let firstErrorMessage: string | null = null;
  if (!hasMinLength) {
    firstErrorMessage = 'Your password must contain at least 8 characters.';
  } else if (!hasUppercase) {
    firstErrorMessage = 'Please include at least one uppercase letter.';
  } else if (!hasLowercase) {
    firstErrorMessage = 'Please include at least one lowercase letter.';
  } else if (!hasNumber) {
    firstErrorMessage = 'Please include at least one number.';
  }

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    isValid,
    requirements,
    firstErrorMessage,
  };
}
