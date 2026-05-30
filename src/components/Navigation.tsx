import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, QrCode, Barcode, Newspaper, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Navigation({ currentPath, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { label: "QR Generator", path: "/qr-code-generator", icon: QrCode },
    { label: "Barcode Generator", path: "/barcode-generator", icon: Barcode },
    { label: "Blog & Guides", path: "/blog", icon: Newspaper },
    { label: "Admin Console", path: "/admin", icon: Lock },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleLinkClick("/")}
          className="flex cursor-pointer items-center space-x-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-150 dark:shadow-none group-hover:scale-105 transition-transform duration-300">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              CodeCraft
              <span className="ml-1.5 text-[9px] rounded-full px-1.5 py-0.5 bg-blue-150 text-blue-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold tracking-wider uppercase">PRO</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-550 -mt-1 hidden sm:inline">
              Barcode & QR Engine
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex space-x-1 lg:space-x-3">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path !== "/" && currentPath.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => handleLinkClick(item.path)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors duration-300 ${
                  isActive 
                    ? "text-blue-600 dark:text-amber-400 font-semibold" 
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 rounded-lg bg-blue-50/50 dark:bg-zinc-900/60 -z-10 border border-blue-105/30 dark:border-zinc-800/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Creator CTA */}
          <button
            onClick={() => handleLinkClick("/qr-code-generator")}
            className="hidden sm:flex items-center space-x-1 duration-300 text-xs font-semibold px-4.5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-100 dark:shadow-none hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Now</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-amber-400 dark:hover:bg-zinc-900 transition-colors duration-200 cursor-pointer"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            id="theme-toggle-btn"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-amber-400 rounded-lg hover:bg-slate-105 dark:hover:bg-zinc-900 transition-colors duration-200 cursor-pointer"
            id="mobile-menu-btn"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-4 py-4 space-y-1"
          >
            {navItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path !== "/" && currentPath.startsWith(item.path));
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => handleLinkClick(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 bg-blue-50/50 dark:text-amber-400 dark:bg-zinc-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-zinc-250 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80">
              <button
                onClick={() => handleLinkClick("/qr-code-generator")}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-100 dark:shadow-none cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create Custom Codes</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
