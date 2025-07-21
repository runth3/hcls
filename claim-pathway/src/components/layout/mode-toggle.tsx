"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarMenuButton } from "@/components/ui/sidebar"

// A makeshift useTheme hook until next-themes is integrated
const useTheme = () => {
  const [theme, setThemeState] = React.useState("light");

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setThemeState(isDarkMode ? 'dark' : 'light');
  }, []);

  const setTheme = (newTheme: "light" | "dark" | "system") => {
    if (newTheme === "system") {
        // Basic system preference detection
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        newTheme = systemPrefersDark ? "dark" : "light";
    }
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setThemeState(newTheme);
  };
  return { theme, setTheme };
};


export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <SidebarMenuButton
      onClick={toggleTheme}
      tooltip={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label="Toggle theme"
      className="w-full"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="group-data-[collapsible=icon]:hidden">
        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </SidebarMenuButton>
  )
}
