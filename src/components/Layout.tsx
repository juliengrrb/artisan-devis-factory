
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { Eye, Pencil, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

export function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const location = useLocation();

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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center text-white hover:bg-[#444444] ${
                  mode === "edit" ? "bg-[#444444]" : ""
                }`}
                onClick={() => setMode("edit")}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Édition
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center text-white hover:bg-[#444444] ${
                  mode === "preview" ? "bg-[#444444]" : ""
                }`}
                onClick={() => setMode("preview")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualisation
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="destructive" 
                size="sm"
              >
                Annuler
              </Button>
              <Button 
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                Enregistrer
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600 flex items-center"
              >
                Finaliser et envoyer
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <Outlet />
      </div>
    </div>
  );
}
