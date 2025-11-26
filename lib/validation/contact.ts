import { z } from "zod";

const subjectOptions = ["general", "quote", "support", "partnership", "billing", "other"] as const;
const budgetOptions = [
  "under-1k",
  "1k-5k",
  "5k-10k",
  "10k-25k",
  "25k-50k",
  "50k-plus",
] as const;
const timelineOptions = ["asap", "1-month", "3-months", "6-months", "flexible"] as const;
const preferredContactOptions = ["email", "phone", "either"] as const;

const preprocessToTrimmed = (input: unknown) => (typeof input === "string" ? input.trim() : "");

const requiredTextField = (maxLength: number, missingMessage: string) =>
  z.preprocess(
    preprocessToTrimmed,
    z.string().min(1, missingMessage).max(maxLength, `Keep it under ${maxLength} characters`)
  );

const optionalTextField = (maxLength: number) =>
  z.preprocess(
    preprocessToTrimmed,
    z.string().max(maxLength, `Keep it under ${maxLength} characters`)
  );

const createRequiredSelect = <const T extends readonly [string, ...string[]]>(options: T, message: string) =>
  z.preprocess(
    preprocessToTrimmed,
    z.enum(options, {
      errorMap: () => ({ message }),
      required_error: message,
      invalid_type_error: message,
    })
  );

const createOptionalSelect = <const T extends readonly [string, ...string[]]>(options: T) =>
  z.preprocess(
    preprocessToTrimmed,
    z.union([z.enum(options), z.literal("")])
  );

export const contactFormSchema = z.object({
  firstName: requiredTextField(100, "First name is required"),
  lastName: requiredTextField(100, "Last name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(200, "Keep the email under 200 characters"),
  phone: optionalTextField(30),
  company: optionalTextField(200),
  subject: createRequiredSelect(subjectOptions, "Select a subject"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Keep the message under 2000 characters"),
  budget: createOptionalSelect(budgetOptions),
  timeline: createOptionalSelect(timelineOptions),
  preferredContact: createRequiredSelect(preferredContactOptions, "Choose a contact preference"),
  newsletter: z.boolean().optional().transform((value) => value ?? false),
});

export const CONTACT_FORM_CONSTANTS = {
  subjectOptions,
  budgetOptions,
  timelineOptions,
  preferredContactOptions,
} as const;

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export type ContactInsertPayload = {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  budget: string | null;
  timeline: string | null;
  preferred_contact: string;
  newsletter: boolean;
};

export const buildContactInsertPayload = (values: ContactFormValues): ContactInsertPayload => {
  const fullName = `${values.firstName} ${values.lastName}`.replace(/\s+/g, " ").trim();

  const toNullable = (value: string) => (value.trim().length === 0 ? null : value);

  return {
    first_name: values.firstName,
    last_name: values.lastName,
    full_name: fullName,
    email: values.email,
    phone: toNullable(values.phone ?? ""),
    company: toNullable(values.company ?? ""),
    subject: values.subject,
    message: values.message,
    budget: values.budget ?? null,
    timeline: values.timeline ?? null,
    preferred_contact: values.preferredContact,
    newsletter: values.newsletter ?? false,
  };
};
