
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export interface EditableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isEditing: boolean;
  onToggleEdit?: () => void;
  previewClassName?: string;
}

const EditableTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  isEditing,
  onToggleEdit,
  previewClassName,
}: EditableTextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  if (isEditing) {
    return (
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        autoFocus
      />
    );
  }
  
  return (
    <div 
      className={cn(
        "min-h-[80px] rounded-md border border-gray-200 p-3 cursor-pointer hover:bg-gray-50", 
        previewClassName
      )}
      onClick={onToggleEdit}
    >
      {value ? (
        <pre className="whitespace-pre-wrap font-sans">{value}</pre>
      ) : (
        <p className="text-gray-400">{placeholder}</p>
      )}
    </div>
  );
};

export { Textarea, EditableTextarea }
