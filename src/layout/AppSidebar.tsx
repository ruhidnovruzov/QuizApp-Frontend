import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Təmin etdiyiniz AuthContext-dən useAuth hook-unu import edirik
import { useAuth, UserRole } from "../context/AuthContext"; 
import Logo from '../../public/images/logo/Azerbaijan_technical_university.png'
// Ikonlar
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import {
    BookCopy, 
    Building, 
    FileQuestion, 
    User, 
    UserRound,
    BarChart3,
    BookOpen,
    GraduationCap,
    Loader2 // Yüklənmə zamanı istifadə edilə bilər
} from 'lucide-react' 

// --- Tip Təyinatı ---
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// --- 1. ADMIN Naviqasiya Elementləri ---
const adminNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/admin/dashboard" },
  { icon: <Building />, name: "Kafedralar", path: "/admin/departments" },
  { icon: <UserRound />, name: "Qruplar", path: "/admin/groups" },
  { icon: <BookCopy />, name: "Fənnlər", path: "/admin/subjects" },
  { icon: <User />, name: "İstifadəçilər", path: "/admin/users" },
  { icon: <FileQuestion />, name: "Quizlər", path: "/quizzes" },
];

// --- 2. TEACHER Naviqasiya Elementləri (Sizin təklifiniz əsasında) ---
const teacherNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/teacher/dashboard" },
  { icon: <BookCopy />, name: "Fənnlərim", path: "/teacher/subjects" }, 
  { icon: <FileQuestion />, name: "Quizlər", path: "/quizzes" }, // Ümumi quizlər siyahısı
];

// --- 3. STUDENT Naviqasiya Elementləri ---
const studentNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/student/dashboard" },
  { icon: <GraduationCap />, name: "Quizlər", path: "/student/quizzes" },
  { icon: <BarChart3 />, name: "Nəticələrim", path: "/student/my-results" },
];

// Bu massiv boş saxlanılır, çünki əsas menyu artıq dinamikdir.
const othersItems: NavItem[] = [];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { role, loading } = useAuth(); // AuthContext-dən rol və loading statusunu götürürük
  const location = useLocation();

  // Rol əsasında naviqasiya massivini seçirik
  const navItems: NavItem[] = (() => {
      switch (role) {
          case 'Teacher':
              return teacherNavItems;
          case 'Student':
              return studentNavItems;
          case 'Admin':
              return adminNavItems;
          default:
              return []; // Heç bir rol yoxdursa (və ya token expires-dirsə), boş menyu
      }
  })();


  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    const allItems = [{ type: "main", items: navItems }, { type: "others", items: othersItems }];

    allItems.forEach(({ type, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: type as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]); // navItems dependency-ə əlavə edildi

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // Yüklənmə statusunu idarə etmək
  if (loading) {
    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 w-[90px] lg:translate-x-0`}
        >
            <div className="flex justify-center h-full items-center">
                <Loader2 className="animate-spin text-brand-500 size-6" />
            </div>
        </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        {/* Logo/Başlıq hissəsi */}
        <Link to={role ? `/${role.toLowerCase()}/dashboard` : "/"}>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <h1 className="text-3xl font-bold dark:text-white text-[#4F46E5]" ><a href="/">QuizApp</a></h1>
            </>
          ) : (
            <img
              src={Logo}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {/* Cari rola uyğun menü göstərilir */}
              {navItems.length > 0 && renderMenuItems(navItems, "main")}
            </div>
            
            {/* othersItems render bloku, əgər istifadə olunarsa */}
            {othersItems.length > 0 && (
                <div className="">
                    <h2
                        className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                            !isExpanded && !isHovered
                                ? "lg:justify-center"
                                : "justify-start"
                        }`}
                    >
                        {isExpanded || isHovered || isMobileOpen ? (
                            "Digərləri"
                        ) : (
                            <HorizontaLDots />
                        )}
                    </h2>
                    {renderMenuItems(othersItems, "others")}
                </div>
            )}
          </div>
        </nav>
        {/* SidebarWidget burada qalır */}
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;