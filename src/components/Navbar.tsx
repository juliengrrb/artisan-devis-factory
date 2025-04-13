
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Users, Briefcase, Settings, Menu, X } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { 
      name: "Devis", 
      path: "/devis", 
      icon: <FileText className="h-5 w-5" />,
      active: location.pathname === "/devis" || location.pathname.startsWith("/devis/")
    },
    { 
      name: "Clients", 
      path: "/clients", 
      icon: <Users className="h-5 w-5" />,
      active: location.pathname === "/clients"
    },
    { 
      name: "Chantiers", 
      path: "/chantiers", 
      icon: <Briefcase className="h-5 w-5" />,
      active: location.pathname === "/chantiers"
    },
    { 
      name: "Paramètres", 
      path: "/parametres", 
      icon: <Settings className="h-5 w-5" />,
      active: location.pathname === "/parametres"
    }
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:flex flex-col h-screen bg-gradient-to-b from-orange-800 to-orange-600 w-64 fixed">
        <div className="px-6 py-4">
          <h1 className="text-white text-2xl font-bold">Artisan Devis</h1>
        </div>
        
        <nav className="flex-1 mt-4">
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 ${
                    item.active 
                      ? "bg-orange-500 text-white" 
                      : "text-orange-100 hover:bg-orange-700 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="ml-4">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-6 py-4 border-t border-orange-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-orange-300 flex items-center justify-center text-orange-800 font-semibold">
              A
            </div>
            <div className="ml-3">
              <p className="text-white">Artisan Pro</p>
              <p className="text-orange-200 text-sm">artisan@example.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navbar */}
      <div className="md:hidden bg-orange-600 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-white text-xl font-bold">Artisan Devis</h1>
          <button 
            className="text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {isMenuOpen && (
          <nav className="px-2 pb-3">
            <ul>
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      item.active 
                        ? "bg-orange-500 text-white" 
                        : "text-orange-100 hover:bg-orange-700 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
