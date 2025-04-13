
import { Button } from "@/components/ui/button";
import { PenLine, Eye, ChevronDown, X } from "lucide-react";
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
    <div className="flex items-center bg-orange-secondary border-b border-orange-primary p-2 w-full">
      <h1 className="text-xl font-medium text-orange-primary mr-4">{title}</h1>
      
      {showEditButton && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center text-orange-primary bg-white border-orange-primary mr-2"
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
          className="flex items-center text-orange-primary bg-white border-orange-primary"
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
            className="flex items-center text-orange-primary bg-white border-orange-primary"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          >
            Options <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          
          {isOptionsOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-orange-secondary border border-orange-primary rounded shadow-lg z-10">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-orange-accent cursor-pointer">Configuration</li>
                <li className="px-4 py-2 hover:bg-orange-accent cursor-pointer">Format numéro</li>
                <li className="px-4 py-2 hover:bg-orange-accent cursor-pointer">Personnaliser</li>
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
            className="bg-white border-orange-primary text-orange-primary"
            onClick={onCancel}
          >
            Annuler
          </Button>
        )}
        
        {showSaveButton && (
          <Button 
            size="sm"
            className="bg-orange-primary text-white hover:bg-orange-600"
            onClick={onSave}
          >
            Enregistrer
          </Button>
        )}
        
        {showFinalizeButton && (
          <div className="relative">
            <Button 
              size="sm"
              className="bg-orange-primary text-white hover:bg-orange-600 flex items-center"
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
        className="ml-2 text-orange-primary hover:bg-orange-accent"
        onClick={handleCreateQuote}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
