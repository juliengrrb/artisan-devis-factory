
import { Navbar } from "./Navbar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-stone-200 to-white">
      <Navbar />
      
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <div className="flex-grow">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
