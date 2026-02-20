import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/offerly-logo.png";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-[15px] font-medium transition ${
      isActive
        ? "bg-blue-500/20 text-blue-400"
        : "text-slate-300 hover:text-slate-100"
    }`;

  const handleHomeClick = () => {
    setOpen(false);
    navigate(user.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* ---------- BRAND ---------- */}
        <div
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={logo}
            alt="Offerly"
            className="h-8 lg:h-9 w-auto select-none"
          />
          <span className="text-slate-100 font-semibold text-xl tracking-tight hidden sm:block">
            Offerly
          </span>
        </div>

        {/* ---------- DESKTOP LINKS ---------- */}
        <div className="hidden md:flex items-center gap-5">
          {user.role === "student" && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/analytics" className={linkClass}>
                Analytics
              </NavLink>
              <NavLink to="/applications/new" className={linkClass}>
                Add Application
              </NavLink>
            </>
          )}

          {user.role === "admin" && (
            <>
              <NavLink to="/admin" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/applications" className={linkClass}>
                Applications
              </NavLink>
              <NavLink to="/admin/analytics" className={linkClass}>
                Analytics
              </NavLink>
            </>
          )}

          <span className="text-xs text-slate-400 ml-2">
            {user.role.toUpperCase()}
          </span>

          <button
            onClick={logout}
            className="text-sm bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>

        {/* ---------- MOBILE TOGGLE ---------- */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-slate-300 text-2xl"
        >
          ☰
        </button>
      </div>

      {/* ---------- MOBILE MENU ---------- */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-2">
          {user.role === "student" && (
            <>
              <NavLink onClick={() => setOpen(false)} to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink onClick={() => setOpen(false)} to="/analytics" className={linkClass}>
                Analytics
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/applications/new"
                className={linkClass}
              >
                Add Application
              </NavLink>
            </>
          )}

          {user.role === "admin" && (
            <>
              <NavLink onClick={() => setOpen(false)} to="/admin" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/admin/applications"
                className={linkClass}
              >
                Applications
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/admin/analytics"
                className={linkClass}
              >
                Analytics
              </NavLink>
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {user.role.toUpperCase()}
            </span>
            <button
              onClick={logout}
              className="text-sm bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
