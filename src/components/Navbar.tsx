
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Users, Briefcase, Settings, Menu, X, HardHat } from "lucide-react";

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
      <div className="hidden md:flex flex-col h-screen bg-gradient-to-b from-stone-900 to-btp-950 w-64 fixed">
        <div className="px-6 py-4 flex items-center">
          <HardHat className="h-8 w-8 text-btp-500 mr-3" />
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
                      ? "bg-btp-800 text-btp-200" 
                      : "text-stone-300 hover:bg-stone-800 hover:text-btp-200"
                  }`}
                >
                  {item.icon}
                  <span className="ml-4">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-6 py-4 border-t border-stone-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-btp-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="ml-3">
              <p className="text-white">Artisan Pro</p>
              <p className="text-stone-400 text-sm">artisan@example.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navbar */}
      <div className="md:hidden bg-stone-900 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <HardHat className="h-6 w-6 text-btp-500 mr-2" />
            <h1 className="text-white text-xl font-bold">Artisan Devis</h1>
          </div>
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
                        ? "bg-btp-800 text-btp-200" 
                        : "text-stone-300 hover:bg-stone-800 hover:text-btp-200"
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
