
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Outlet } from "react-router-dom";

export function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
        <Outlet />
      </div>
    </div>
  );
}
