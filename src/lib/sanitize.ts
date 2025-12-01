/**
 * Input Sanitization and Validation Utilities
 * Provides security functions to sanitize user inputs and prevent XSS/injection attacks
 */

// HTML entities to escape
const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Remove HTML tags from a string
 */
export function stripHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize string input - removes dangerous characters
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  
  // Remove null bytes and other control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number (Saudi format or international)
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");
  // Saudi format: 05xxxxxxxx or +966xxxxxxxxx
  // International: starts with + followed by 7-15 digits
  const phoneRegex = /^(\+966|05)\d{8,9}$|^\+\d{7,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate Saudi ID number (10 digits starting with 1 or 2)
 */
export function isValidSaudiId(id: string): boolean {
  const idRegex = /^[12]\d{9}$/;
  return idRegex.test(id);
}

/**
 * Validate Iqama/Residency number (10 digits starting with 2)
 */
export function isValidIqama(iqama: string): boolean {
  const iqamaRegex = /^2\d{9}$/;
  return iqamaRegex.test(iqama);
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== "string") return "";
  
  // Remove path components
  let sanitized = filename.replace(/^.*[\\\/]/, "");
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, "");
  
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, "");
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf("."));
    sanitized = sanitized.slice(0, 255 - ext.length) + ext;
  }
  
  return sanitized || "unnamed";
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: unknown, options?: {
  min?: number;
  max?: number;
  allowFloat?: boolean;
}): number | null {
  const num = typeof input === "string" ? parseFloat(input) : Number(input);
  
  if (isNaN(num) || !isFinite(num)) return null;
  
  if (!options?.allowFloat && !Number.isInteger(num)) return null;
  
  if (options?.min !== undefined && num < options.min) return null;
  if (options?.max !== undefined && num > options.max) return null;
  
  return num;
}

/**
 * Validate date string
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Sanitize SQL-like patterns (for search queries)
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== "string") return "";
  
  // Escape SQL wildcards and special characters
  return query
    .replace(/[%_\\]/g, "\\$&")
    .replace(/'/g, "''")
    .trim()
    .substring(0, 200);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  }
  
  if (password.length > 128) {
    errors.push("كلمة المرور طويلة جداً");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("كلمة المرور يجب أن تحتوي على حرف كبير");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("كلمة المرور يجب أن تحتوي على حرف صغير");
  }
  
  if (!/\d/.test(password)) {
    errors.push("كلمة المرور يجب أن تحتوي على رقم");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
}
