
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Outlet } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import AppearanceConfigButton from "./AppearanceConfigButton";

export function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  // Check for mobile view
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

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar toggle area - narrow strip on the left edge */}
      {!isMobile && (
        <div 
          className="fixed top-0 left-0 h-screen w-2 z-40 hover:cursor-pointer bg-transparent"
          onMouseEnter={() => setShowSidebar(true)}
        />
      )}
      
      {/* Navbar that shows on hover */}
      <div 
        className={`fixed top-0 left-0 h-screen transition-all duration-300 z-30 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "hidden" : "block"}`}
        onMouseLeave={() => setShowSidebar(false)}
      >
        <Navbar />
      </div>
      
      {/* Show mobile navbar on small screens */}
      {isMobile && (
        <div className="block z-30">
          <Navbar />
        </div>
      )}
      
      {/* Main content takes full width */}
      <div className="flex-1 min-h-screen flex flex-col w-full">
        {/* Top bar for mode switching in quote view */}
        <div className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={() => setMode("edit")} 
              className={`flex items-center px-4 py-1 rounded ${
                mode === "edit" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Édition
            </button>
            <button 
              onClick={() => setMode("preview")} 
              className={`flex items-center px-4 py-1 rounded ${
                mode === "preview" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Prévisualisation
            </button>
          </div>
          
          {mode === "preview" && (
            <div className="flex items-center space-x-2">
              <AppearanceConfigButton />
              <button className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                Annuler
              </button>
              <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Enregistrer
              </button>
              <div className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                Finaliser et envoyer
              </div>
            </div>
          )}
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
