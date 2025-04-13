
import { Navbar } from "./Navbar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-stone-100 to-btp-50">
      <Navbar />
      
      <div className="flex-1 md:ml-64 min-h-screen">
        <div className="md:pt-0 pt-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
