/** Shared contact-form validation — used by the browser AND the API route. */
export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

// Practical email check: something@something.tld, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalize(input: Partial<Record<keyof ContactInput, unknown>>): ContactInput {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    subject: str(input.subject),
    message: str(input.message),
  };
}

export function validateContact(data: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (!data.name) errors.name = "Enter your name.";
  else if (data.name.length < LIMITS.name.min) errors.name = "Name is too short.";
  else if (data.name.length > LIMITS.name.max) errors.name = `Keep your name under ${LIMITS.name.max} characters.`;

  if (!data.email) errors.email = "Enter your email address.";
  else if (data.email.length > LIMITS.email.max || !EMAIL_RE.test(data.email))
    errors.email = "Enter a valid email address, like name@example.com.";

  if (!data.subject) errors.subject = "Enter a subject.";
  else if (data.subject.length < LIMITS.subject.min) errors.subject = "Subject is too short.";
  else if (data.subject.length > LIMITS.subject.max) errors.subject = `Keep the subject under ${LIMITS.subject.max} characters.`;

  if (!data.message) errors.message = "Enter a message.";
  else if (data.message.length < LIMITS.message.min) errors.message = `Message should be at least ${LIMITS.message.min} characters.`;
  else if (data.message.length > LIMITS.message.max) errors.message = `Keep the message under ${LIMITS.message.max} characters.`;

  return errors;
}
