import { Link, NavLink, Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">App</h1>
        <nav className="flex items-center gap-3 text-sm">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) => (isActive ? "underline" : undefined)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/settings"
            className={({ isActive }) => (isActive ? "underline" : undefined)}
          >
            Settings
          </NavLink>
        </nav>
        <Link className="ml-auto text-sm underline" to="/">
          Exit app
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
