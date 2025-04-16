
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
        className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
      >
        <Sliders className="h-4 w-4 mr-2" />
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
