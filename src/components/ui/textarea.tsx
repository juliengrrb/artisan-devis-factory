
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
  // Créons un état local pour suivre la valeur pendant l'édition
  const [inputValue, setInputValue] = React.useState(value);
  
  // Mettre à jour l'état local quand la valeur externe change
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  if (isEditing) {
    return (
      <Textarea
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
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
