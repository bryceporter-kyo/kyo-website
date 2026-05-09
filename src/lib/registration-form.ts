
// ─── Question Types ───────────────────────────────────────────────────────────

export type QuestionType =
  | 'short_text'       // Single-line input
  | 'long_text'        // Multi-line textarea
  | 'email'            // Email with format validation
  | 'phone'            // Phone number input
  | 'number'           // Numeric input
  | 'date'             // Date picker
  | 'single_choice'    // Radio buttons — pick one
  | 'multiple_choice'  // Checkboxes — pick many
  | 'dropdown'         // Select dropdown — pick one
  | 'true_false'       // Yes / No radio
  | 'rating'           // 1–5 star / number scale
  | 'file_upload'      // File attachment
  | 'section_header';  // Visual divider, not a real input

export interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  helpText?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  // For choice-based types
  options?: string[];
  allowOther?: boolean;  // Adds an "Other (please specify)" option
  // For number / rating types
  min?: number;
  max?: number;
  // For file_upload types
  acceptedFileTypes?: string; // e.g. '.pdf,.doc,.docx'
  maxFileSizeMb?: number;
  // For section_header types
  description?: string;
  // Attachments
  imageUrl?: string;
  links?: { label: string; url: string }[];
}

// ─── Form Configuration ───────────────────────────────────────────────────────

export type FormProgram = 'orchestras' | 'upbeat';

export interface RegistrationFormConfig {
  /** Firestore document ID — matches FormProgram */
  id: FormProgram;
  title: string;
  description?: string;
  /** Whether the form is publicly accepting submissions */
  isOpen: boolean;
  /** Shown to users when isOpen is false */
  closedMessage?: string;
  submissionPage?: {
    title: string;
    message: string;
    redirectUrl?: string;
    redirectDelaySeconds?: number;
  };
  webhookUrl?: string;
  questions: FormQuestion[];
  updatedAt?: string;
  updatedBy?: string;
}

// ─── Default / Factory Helpers ────────────────────────────────────────────────

export function createEmptyQuestion(type: QuestionType = 'short_text', order = 0): FormQuestion {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: '',
    helpText: '',
    placeholder: '',
    required: false,
    order,
    options: type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown'
      ? ['Option 1', 'Option 2']
      : undefined,
    allowOther: false,
  };
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Short Text',
  long_text: 'Paragraph',
  email: 'Email Address',
  phone: 'Phone Number',
  number: 'Number',
  date: 'Date',
  single_choice: 'Single Choice (Radio)',
  multiple_choice: 'Multiple Choice (Checkbox)',
  dropdown: 'Dropdown',
  true_false: 'Yes / No',
  rating: 'Rating Scale',
  file_upload: 'File Upload',
  section_header: 'Section Header',
};

export const DEFAULT_ORCHESTRAS_FORM: RegistrationFormConfig = {
  id: 'orchestras',
  title: 'Orchestra Program Registration',
  description: 'Register for the Kawartha Youth Orchestra program. Please complete all required fields.',
  isOpen: false,
  closedMessage: 'Registration is not currently open. Please check back later or contact us for more information.',
  submissionPage: {
    title: 'Thank You!',
    message: 'Your registration has been received. We will be in touch shortly.',
    redirectDelaySeconds: 5,
  },
  questions: [],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_UPBEAT_FORM: RegistrationFormConfig = {
  id: 'upbeat',
  title: 'UpBeat Program Registration',
  description: 'Register for the KYO UpBeat program. Please complete all required fields.',
  isOpen: false,
  closedMessage: 'Registration is not currently open. Please check back later or contact us for more information.',
  submissionPage: {
    title: 'Registration Complete!',
    message: 'Thank you for signing up for UpBeat. We are excited to have you!',
    redirectDelaySeconds: 5,
  },
  questions: [],
  updatedAt: new Date().toISOString(),
};
