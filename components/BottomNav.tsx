"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, Lightbulb, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: Folder,
  },
  {
    name: "Ideas",
    href: "/ideas",
    icon: Lightbulb,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
      <div
        className="flex items-center justify-around h-[60px] px-4"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] min-h-[44px] px-3 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-white/60 hover:text-white/80 active:text-white"
              )}
            >
              <Icon
                size={24}
                className={cn(
                  "transition-all duration-200",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-200",
                  isActive && "text-primary font-semibold"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
