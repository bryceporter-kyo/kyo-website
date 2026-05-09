
"use client";

import { QuestionType, QUESTION_TYPE_LABELS } from "@/lib/registration-form";
import {
  AlignLeft,
  AlignJustify,
  Mail,
  Phone,
  Hash,
  Calendar,
  CircleDot,
  CheckSquare,
  ChevronDown,
  ToggleLeft,
  Star,
  Paperclip,
  Minus,
} from "lucide-react";

const QUESTION_TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  short_text: <AlignLeft className="h-4 w-4" />,
  long_text: <AlignJustify className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  single_choice: <CircleDot className="h-4 w-4" />,
  multiple_choice: <CheckSquare className="h-4 w-4" />,
  dropdown: <ChevronDown className="h-4 w-4" />,
  true_false: <ToggleLeft className="h-4 w-4" />,
  rating: <Star className="h-4 w-4" />,
  file_upload: <Paperclip className="h-4 w-4" />,
  section_header: <Minus className="h-4 w-4" />,
};

interface QuestionTypeIconProps {
  type: QuestionType;
  className?: string;
}

export function QuestionTypeIcon({ type, className }: QuestionTypeIconProps) {
  return (
    <span className={className} title={QUESTION_TYPE_LABELS[type]}>
      {QUESTION_TYPE_ICONS[type]}
    </span>
  );
}
