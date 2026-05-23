import { NavLink } from "react-router-dom";
import "../styles/NavBar.css";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Banks", path: "/" },
  { label: "Cards", path: "/cards" },
];

export function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link">
          Finance Planner
        </NavLink>
      </div>

      <nav>
        <ul className="navbar-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
