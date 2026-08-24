"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import SearchOverlay from "./SearchOverlay";
import AccountPanel from "./AccountPanel";
import {
  Search,
  UserCircle,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { name: "HOME", href: "/" },
  { name: "STATIONERY", href: "/stationery" },
  { name: "NOTE BOOKS", href: "/notebooks" },
  {
    name: "MORE",
    href: "/products",
    children: [
      { name: "All Products", href: "/products" },
      { name: "About Us", href: "/products/about" },
      { name: "Contact", href: "/products/contact" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const navRef = useRef(null);

  // Float as a contained bar at the top of the page, then stick full-width once
  // the user scrolls past the first slice of the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (item) => {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // Close the dropdown on outside click / Escape
  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close menus whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  return (
    <>
      <header
      className={
        "z-50 w-full transition-all duration-300 " +
        (scrolled
          ? "fixed inset-x-0 top-0 bg-white shadow-[0_2px_18px_rgba(0,0,0,0.12)]"
          : "absolute inset-x-0 top-0 lg:top-[42px]")
      }
    >
      <div
        className={
          "mx-auto flex h-[62px] w-full max-w-[1510px] transition-all duration-300 lg:h-[86px] lg:w-[80%] " +
          (scrolled ? "" : "bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.06)]")
        }
      >
        {/* Logo */}
        <div className="flex w-[195px] shrink-0 items-center px-4 lg:w-[300px] lg:px-6">
          <Link
            href="/"
            aria-label="ChoiceKraft home"
            className="flex items-center gap-2.5 lg:gap-3"
          >
            <img
              src="/images/logo.png"
              alt="ChoiceKraft"
              className="h-[34px] w-auto shrink-0 object-contain lg:h-[52px]"
            />

            <span className="flex min-w-0 flex-col justify-center">
              <span className="text-[16px] font-bold leading-none tracking-[0.3px] text-ink lg:text-[21px]">
                ChoiceKraft
              </span>
              <span className="mt-1 hidden whitespace-nowrap text-[9px] font-medium uppercase leading-none tracking-[1.2px] text-muted sm:block lg:text-[10px]">
                Right choice to success
              </span>
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav
          ref={navRef}
          className="hidden flex-1 items-stretch justify-center lg:flex"
        >
          {navItems.map((item) => {
            const active = isActive(item);
            const open = openMenu === item.name;

            return (
              <div key={item.name} className="relative flex items-stretch">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-expanded={item.children ? open : undefined}
                  aria-haspopup={item.children ? "true" : undefined}
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault();
                      setOpenMenu(open ? null : item.name);
                    }
                  }}
                  onMouseEnter={() =>
                    setOpenMenu(item.children ? item.name : null)
                  }
                  className={
                    "group relative flex items-center justify-center whitespace-nowrap px-7 text-[14px] font-medium tracking-[1.6px] xl:px-9 text-ink transition-colors " +
                    (active ? "bg-surface" : "hover:bg-surface-alt")
                  }
                >
                  {item.name}

                  {/* Underline: solid when active, grows from centre on hover */}
                  <span
                    className={
                      "absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 bg-primary transition-all duration-300 " +
                      (active ? "w-full" : "w-0 group-hover:w-full")
                    }
                  />
                </Link>

                {/* Dropdown */}
                {item.children && open && (
                  <div
                    onMouseLeave={() => setOpenMenu(null)}
                    className="absolute left-0 top-full z-50 w-[210px] border-t-[3px] border-primary bg-white py-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={
                          "block px-6 py-3 text-[13px] font-medium tracking-[1px] transition-colors hover:bg-surface hover:text-primary " +
                          (pathname === child.href
                            ? "text-primary"
                            : "text-ink-soft")
                        }
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop icon strip */}
        <div className="ml-auto hidden shrink-0 lg:flex">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex w-[70px] items-center justify-center bg-surface transition-colors hover:bg-surface-hover"
          >
            <Search size={25} strokeWidth={1.7} className="text-ink" />
          </button>

          <button
            onClick={() => setAccountOpen(true)}
            aria-label="Account"
            className="flex w-[70px] items-center justify-center bg-line-soft transition-colors hover:bg-line"
          >
            <UserCircle size={25} strokeWidth={1.7} className="text-ink" />
          </button>

          <button
            onClick={() => setCartOpen(true)}
            aria-label={"Shopping cart, " + count + " items"}
            className="relative flex w-[70px] items-center justify-center bg-line transition-colors hover:bg-line-strong"
          >
            <ShoppingBag size={25} strokeWidth={1.7} className="text-ink" />
            <span className="absolute right-[14px] top-[20px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-foreground">
              {count}
            </span>
          </button>
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center lg:hidden">
          <button
            onClick={() => setCartOpen(true)}
            aria-label={"Shopping cart, " + count + " items"}
            className="relative flex h-full w-[60px] items-center justify-center"
          >
            <ShoppingBag size={24} strokeWidth={1.6} className="text-ink" />
            <span className="absolute right-2 top-4 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
              {count}
            </span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-full w-[60px] items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={26} strokeWidth={1.6} className="text-ink" />
            ) : (
              <Menu size={26} strokeWidth={1.6} className="text-ink" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-auto max-w-[1510px] border-t border-line bg-white shadow-lg lg:hidden">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const active = isActive(item);
              const open = openMenu === item.name;

              return (
                <div key={item.name} className="border-b border-line-soft">
                  <div className="flex items-stretch">
                    <Link
                      href={item.href}
                      className={
                        "flex-1 px-6 py-4 text-[13px] font-medium tracking-[2px] text-ink " +
                        (active ? "border-l-4 border-l-primary bg-surface" : "")
                      }
                    >
                      {item.name}
                    </Link>

                    {item.children && (
                      <button
                        onClick={() => setOpenMenu(open ? null : item.name)}
                        aria-label={"Toggle " + item.name + " submenu"}
                        aria-expanded={open}
                        className="flex w-14 items-center justify-center border-l border-line-soft"
                      >
                        <ChevronDown
                          size={18}
                          strokeWidth={2}
                          className={
                            "text-ink-soft transition-transform duration-200 " +
                            (open ? "rotate-180" : "")
                          }
                        />
                      </button>
                    )}
                  </div>

                  {item.children && open && (
                    <div className="bg-surface-alt">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-10 py-3 text-[13px] text-ink-soft hover:text-primary"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex">
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                aria-label="Search"
                className="flex flex-1 items-center justify-center py-4 hover:bg-surface"
              >
                <Search size={22} strokeWidth={1.6} className="text-ink" />
              </button>
              <button
                onClick={() => { setMobileOpen(false); setAccountOpen(true); }}
                aria-label="Account"
                className="flex flex-1 items-center justify-center border-l border-line-soft py-4 hover:bg-surface"
              >
                <UserCircle size={22} strokeWidth={1.7} className="text-ink" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
      <CartDrawer />
    </>
  );
}
