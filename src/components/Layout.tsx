import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { 
  Eye, 
  PenLine, 
  Download, 
  Printer, 
  RotateCcw, 
  ChevronDown, 
  X 
} from "lucide-react";
import { Button } from "./ui/button";
import { useAppContext } from "@/context/AppContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { toast } from "sonner";

export function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const location = useLocation();
  const { id } = useParams();
  const { currentQuote, updateQuote } = useAppContext();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Only show the toolbar on quote routes
  const showToolbar = location.pathname.includes('/devis/');

  const handleSave = () => {
    if (currentQuote) {
      updateQuote(currentQuote);
      toast.success("Devis enregistré avec succès");
    }
  };

  const handleFinalize = () => {
    toast.success("Devis finalisé et prêt à être envoyé");
    // Implement finalization logic here
  };

  const handleCancel = () => {
    // Implement cancel logic, perhaps navigating back or resetting changes
  };

  return (
    <div className="flex h-screen bg-white">
      {!isMobile && (
        <div 
          className="fixed top-0 left-0 h-screen w-2 z-40 hover:cursor-pointer bg-transparent"
          onMouseEnter={() => setShowSidebar(true)}
        />
      )}
      
      <div 
        className={`fixed top-0 left-0 h-screen transition-all duration-300 z-30 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "hidden" : "block"}`}
        onMouseLeave={() => setShowSidebar(false)}
      >
        <Navbar />
      </div>
      
      {isMobile && (
        <div className="block z-30">
          <Navbar />
        </div>
      )}
      
      <div className="flex-1 min-h-screen flex flex-col w-full">
        {showToolbar && (
          <div className="bg-[#333333] text-white h-14 px-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-[#444444] rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center text-white hover:bg-[#4a4a4a] ${
                    mode === "edit" ? "bg-[#4a4a4a]" : ""
                  }`}
                  onClick={() => setMode("edit")}
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
                  onClick={() => setMode("preview")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Prévisualisation
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {mode === "preview" && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#4a4a4a]"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#4a4a4a]"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#4a4a4a]"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#4a4a4a]"
                  >
                    Options
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Modifier l'apparence</DropdownMenuItem>
                  {/* Add more options as needed */}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-[#4a4a4a]"
                onClick={handleCancel}
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
                onClick={handleFinalize}
              >
                Finaliser et envoyer
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-[#4a4a4a]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <Outlet context={{ mode }} />
      </div>
    </div>
  );
}
