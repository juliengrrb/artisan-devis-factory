
import { Button } from "@/components/ui/button";
import { PenLine, Eye, ChevronDown, X, HardHat } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

interface HeaderProps {
  title: string;
  showEditButton?: boolean;
  showPreviewButton?: boolean;
  showOptionsButton?: boolean;
  showCancelButton?: boolean;
  showSaveButton?: boolean;
  showFinalizeButton?: boolean;
  onEdit?: () => void;
  onPreview?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onFinalize?: () => void;
}

export function Header({
  title,
  showEditButton = false,
  showPreviewButton = false,
  showOptionsButton = false,
  showCancelButton = false,
  showSaveButton = false,
  showFinalizeButton = false,
  onEdit,
  onPreview,
  onCancel,
  onSave,
  onFinalize
}: HeaderProps) {
  const { createQuote } = useAppContext();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleCreateQuote = () => {
    createQuote();
  };

  return (
    <div className="flex items-center bg-stone-900 border-b border-stone-700 p-2 w-full">
      <h1 className="text-xl font-medium text-white mr-4">{title}</h1>
      
      {showEditButton && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center text-stone-200 bg-transparent border-stone-600 hover:bg-stone-800 mr-2"
          onClick={onEdit}
        >
          <PenLine className="h-4 w-4 mr-1" />
          Édition
        </Button>
      )}
      
      {showPreviewButton && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center text-stone-200 bg-transparent border-stone-600 hover:bg-stone-800"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4 mr-1" />
          Prévisualisation
        </Button>
      )}
      
      <div className="flex-grow"></div>
      
      {showOptionsButton && (
        <div className="relative mr-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center text-stone-200 bg-transparent border-stone-600 hover:bg-stone-800"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          >
            Options <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          
          {isOptionsOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-stone-200 rounded shadow-lg z-10">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-stone-100 text-stone-900 cursor-pointer">Configuration</li>
                <li className="px-4 py-2 hover:bg-stone-100 text-stone-900 cursor-pointer">Format numéro</li>
                <li className="px-4 py-2 hover:bg-stone-100 text-stone-900 cursor-pointer">Personnaliser</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {showCancelButton && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-transparent border-stone-600 text-stone-200 hover:bg-stone-800"
            onClick={onCancel}
          >
            Annuler
          </Button>
        )}
        
        {showSaveButton && (
          <Button 
            size="sm"
            className="bg-btp-600 text-white hover:bg-btp-700"
            onClick={onSave}
          >
            Enregistrer
          </Button>
        )}
        
        {showFinalizeButton && (
          <div className="relative">
            <Button 
              size="sm"
              className="bg-btp-600 text-white hover:bg-btp-700 flex items-center"
              onClick={onFinalize}
            >
              Finaliser et envoyer <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="ml-2 text-white hover:bg-stone-800"
        onClick={handleCreateQuote}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
