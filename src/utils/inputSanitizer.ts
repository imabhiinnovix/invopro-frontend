/**
 * Input sanitization utilities for security
 * These functions help prevent XSS, injection attacks, and ensure data integrity
 *
 * This module uses DOMPurify for comprehensive XSS protection combined with
 * type-specific sanitization for emails, passwords, OTPs, and URLs.
 */

import DOMPurify, { Config as DOMPurifyConfig } from "dompurify";

/**
 * Sanitize general text input using DOMPurify and trimming whitespace
 * @param input - The input string to sanitize
 * @returns Sanitized string with all HTML removed
 */
export const sanitizeText = (input: string): string => {
  if (!input) return "";

  // Use DOMPurify to strip all HTML tags while keeping text content
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  // Trim whitespace
  return cleaned.trim();
};

/**
 * Sanitize email input
 * @param email - Email address to sanitize
 * @returns Sanitized email in lowercase with whitespace removed
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return "";

  // First pass: DOMPurify
  const cleaned = sanitizeText(email);

  // Convert to lowercase and remove all whitespace
  return cleaned.toLowerCase().replace(/\s+/g, "");
};

/**
 * Sanitize password input
 * Only removes leading/trailing whitespace while preserving internal spaces
 * Uses DOMPurify to prevent any HTML/script injection
 * @param password - Password to sanitize
 * @returns Sanitized password
 */
export const sanitizePassword = (password: string): string => {
  if (!password) return "";

  // Use DOMPurify with minimal processing (preserve spaces)
  const cleaned = DOMPurify.sanitize(password, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // Only trim leading and trailing whitespace
  // Don't remove internal spaces as they might be part of the password
  return cleaned.trim();
};

/**
 * Sanitize OTP input - only allow numeric values
 * @param otp - OTP to sanitize
 * @returns Sanitized OTP containing only digits
 */
export const sanitizeOTP = (otp: string): string => {
  if (!otp) return "";

  // First pass: DOMPurify
  const cleaned = DOMPurify.sanitize(otp, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // Only keep numeric characters
  return cleaned.replace(/\D/g, "");
};

/**
 * Escape special characters that could be used for XSS attacks
 * Note: This is rarely needed when using DOMPurify, but kept for backward compatibility
 * @param input - The input string to escape
 * @returns Escaped string
 */
export const escapeHTML = (input: string): string => {
  if (!input) return "";

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
};

/**
 * Sanitize URL input to prevent javascript: and data: URI schemes
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return "";

  // First pass: DOMPurify
  const cleaned = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();

  // Block dangerous URL schemes
  const dangerousSchemes = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "blob:",
  ];
  const lowerURL = cleaned.toLowerCase();

  for (const scheme of dangerousSchemes) {
    if (lowerURL.startsWith(scheme)) {
      console.warn(`Blocked dangerous URL scheme: ${scheme}`);
      return "";
    }
  }

  return cleaned;
};

/**
 * Remove null bytes from input (can be used to bypass security checks)
 * @param input - Input string
 * @returns String without null bytes
 */
export const removeNullBytes = (input: string): string => {
  if (!input) return "";
  return input.replace(/\0/g, "");
};

/**
 * Sanitize rich HTML content (for editors like Jodit)
 * Allows safe HTML tags while removing dangerous content
 * @param html - HTML content to sanitize
 * @param config - Optional DOMPurify configuration
 * @returns Sanitized HTML
 */
export const sanitizeHTML = (
  html: string,
  config?: DOMPurifyConfig,
): string => {
  if (!html) return "";

  const defaultConfig = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
      "b",
      "i",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "style",
      "target",
      "rel",
      "width",
      "height",
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  };

  return DOMPurify.sanitize(html, config || defaultConfig);
};

/**
 * Comprehensive input sanitization for form fields
 * This is the MAIN function you should use throughout the application
 *
 * @param input - Input to sanitize
 * @param type - Type of input field
 * @returns Sanitized input
 *
 * @example
 * // Email field
 * const cleanEmail = sanitizeInput(userInput, 'email');
 *
 * // Password field
 * const cleanPassword = sanitizeInput(userInput, 'password');
 *
 * // OTP field
 * const cleanOTP = sanitizeInput(userInput, 'otp');
 *
 * // General text field
 * const cleanText = sanitizeInput(userInput, 'text');
 */
export const sanitizeInput = (
  input: string,
  type: "text" | "email" | "password" | "otp" | "url" = "text",
): string => {
  if (!input) return "";

  // Remove null bytes first (critical security check)
  let sanitized = removeNullBytes(input);

  // Apply type-specific sanitization with DOMPurify
  switch (type) {
    case "email":
      sanitized = sanitizeEmail(sanitized);
      break;
    case "password":
      sanitized = sanitizePassword(sanitized);
      break;
    case "otp":
      sanitized = sanitizeOTP(sanitized);
      break;
    case "url":
      sanitized = sanitizeURL(sanitized);
      break;
    case "text":
    default:
      sanitized = sanitizeText(sanitized);
      break;
  }

  return sanitized;
};

/**
 * Batch sanitize multiple inputs at once
 * Useful for sanitizing entire form objects
 *
 * @param data - Object with string values to sanitize
 * @param typeMap - Optional map of field names to sanitization types
 * @returns Sanitized object
 *
 * @example
 * const cleanData = sanitizeInputBatch(
 *   { email: userEmail, password: userPassword, name: userName },
 *   { email: 'email', password: 'password', name: 'text' }
 * );
 */
export const sanitizeInputBatch = <T extends Record<string, unknown>>(
  data: T,
  typeMap?: Record<keyof T, "text" | "email" | "password" | "otp" | "url">,
): T => {
  const sanitized = {} as T;

  for (const key in data) {
    const value = data[key];

    if (typeof value === "string") {
      // Auto-detect type based on field name if no type map provided
      let type: "text" | "email" | "password" | "otp" | "url" = "text";

      if (typeMap && typeMap[key]) {
        type = typeMap[key];
      } else {
        const keyLower = String(key).toLowerCase();
        if (keyLower.includes("email")) type = "email";
        else if (keyLower.includes("password")) type = "password";
        else if (keyLower.includes("otp")) type = "otp";
        else if (keyLower.includes("url") || keyLower.includes("link"))
          type = "url";
      }

      sanitized[key] = sanitizeInput(value, type) as T[Extract<
        keyof T,
        string
      >];
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
