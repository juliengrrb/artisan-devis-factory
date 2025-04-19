
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, PenLine, ChevronDown } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface QuoteEditorHeaderProps {
  quoteId: string;
  mode: 'edit' | 'preview';
  onModeChange: (mode: 'edit' | 'preview') => void;
  onOpenAppearanceConfig: () => void;
}

const QuoteEditorHeader: React.FC<QuoteEditorHeaderProps> = ({
  quoteId,
  mode,
  onModeChange,
  onOpenAppearanceConfig
}) => {
  const { quotes, updateQuote } = useAppContext();
  const quote = quotes.find(q => q.id === quoteId);
  
  const handleSave = () => {
    if (quote) {
      updateQuote(quote);
    }
  };

  return (
    <div className="bg-[#333333] text-white h-14 px-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-[#444444] rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center text-white hover:bg-[#4a4a4a] ${
              mode === "edit" ? "bg-[#4a4a4a]" : ""
            }`}
            onClick={() => onModeChange("edit")}
          >
            <PenLine className="h-4 w-4 mr-2" />
            Édition
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center text-white hover:bg-[#4a4a4a] ${
              mode === "preview" ? "bg-[#4a4a4a]" : ""
            }`}
            onClick={() => onModeChange("preview")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Prévisualisation
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white hover:bg-[#4a4a4a]"
          onClick={onOpenAppearanceConfig}
        >
          Modifier l'apparence
        </Button>

        <Button 
          variant="ghost" 
          size="sm"
          className="text-white hover:bg-[#4a4a4a]"
        >
          Annuler
        </Button>

        <Button 
          variant="default"
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSave}
        >
          Enregistrer
        </Button>

        <Button
          variant="default"
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white flex items-center"
        >
          Finaliser et envoyer
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuoteEditorHeader;
