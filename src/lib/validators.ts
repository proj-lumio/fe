export interface ValidationResult {
  valid: boolean
  error: string
}

export function validateEmail(email: string, t: { email_invalid: string }): ValidationResult {
  if (!email.trim()) {
    return { valid: false, error: t.email_invalid }
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) {
    return { valid: false, error: t.email_invalid }
  }
  return { valid: true, error: "" }
}

export function validatePassword(
  password: string,
  t: { password_min: string; password_number: string; password_special: string }
): ValidationResult {
  if (password.length < 8) {
    return { valid: false, error: t.password_min }
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: t.password_number }
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, error: t.password_special }
  }
  return { valid: true, error: "" }
}
