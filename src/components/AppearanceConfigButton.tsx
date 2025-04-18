
import React, { useState } from "react";
import { Sliders } from "lucide-react";
import DocumentAppearanceConfig from "./DocumentAppearanceConfig";
import { DocumentConfig } from "../types/documentConfig";

type AppearanceConfigButtonProps = {
  onSave?: (config: DocumentConfig) => void;
  initialConfig?: DocumentConfig;
};

export default function AppearanceConfigButton({ 
  onSave, 
  initialConfig 
}: AppearanceConfigButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (config: DocumentConfig) => {
    if (onSave) {
      onSave(config);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
      >
        <Sliders className="h-4 w-4 mr-1.5" />
        Modifier l'apparence
      </button>

      {isOpen && (
        <DocumentAppearanceConfig 
          onSave={handleSave}
          onCancel={() => setIsOpen(false)}
          initialConfig={initialConfig}
        />
      )}
    </>
  );
}
