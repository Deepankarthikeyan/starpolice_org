import { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { getMenuList } from "./Menu";

const BASE_PATH = "/student";
const PRIMARY_TAB_COUNT = 4;

function routeSlug(pathname: string) {
  const parts = pathname.replace(/\/+$/, "").split("/");
  return parts[parts.length - 1] || "dashboard";
}

const StudentMobileNav = () => {
  const location = useLocation();
  const { auth, setOpenMenuToggle } = useContext(ThemeContext);
  const menuList = useMemo(() => getMenuList("student", auth), [auth]);
  const currentSlug = routeSlug(location.pathname);

  const primaryTabs = menuList.slice(0, PRIMARY_TAB_COUNT);
  const overflowTabs = menuList.slice(PRIMARY_TAB_COUNT);
  const overflowActive = overflowTabs.some((item) => item.to === currentSlug);

  if (!menuList.length) {
    return null;
  }

  return (
    <nav className="spa-student-bottom-nav" aria-label="Student quick navigation">
      {primaryTabs.map((item) => {
        const isActive = item.to === currentSlug;
        return (
          <Link
            key={item.to}
            to={`${BASE_PATH}/${item.to}`}
            className={`spa-student-bottom-nav-item${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="spa-student-bottom-nav-icon" aria-hidden="true">{item.iconStyle}</span>
            <span className="spa-student-bottom-nav-label">{item.title}</span>
          </Link>
        );
      })}
      {overflowTabs.length > 0 && (
        <button
          type="button"
          className={`spa-student-bottom-nav-item spa-student-bottom-nav-more${overflowActive ? " is-active" : ""}`}
          aria-label="More menu items"
          onClick={() => setOpenMenuToggle(true)}
        >
          <span className="spa-student-bottom-nav-icon" aria-hidden="true">
            <i className="material-symbols-outlined">apps</i>
          </span>
          <span className="spa-student-bottom-nav-label">More</span>
        </button>
      )}
    </nav>
  );
};

export default StudentMobileNav;
