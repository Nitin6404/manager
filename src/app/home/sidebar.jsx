"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserPlus } from "lucide-react"; // icons

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-1 h-screen bg-black text-white flex flex-col justify-between transition-[width] duration-200",
        " rounded-2xl"
      )}
      aria-label="Primary"
    >
      <div className="flex flex-col items-center pt-3 gap-6">
        <Link
          href="/"
          className={cn(
            "group flex flex-col items-center gap-1 px-2 py-2 rounded-2xl",
            pathname === "/" ? "bg-white/10" : "bg-transparent"
          )}
        >
          <HomeBadge />
          <span className="text-xs opacity-90">Home</span>
        </Link>
      </div>

      <div className="flex flex-col items-center pb-4">
        <Link
          href="/invite"
          className={cn(
            "group flex flex-col items-center gap-1 px-2 py-2 rounded-2xl",
            pathname.startsWith("/invite") ? "bg-white/10" : "bg-transparent"
          )}
        >
          <UserPlus
            className="w-4 h-4 text-white"
            strokeWidth={2}
            absoluteStrokeWidth
          />
          <span className="text-xs opacity-90">Invite</span>
        </Link>
      </div>
    </aside>
  );
}

function HomeBadge() {
  return (
    <div className="w-10 h-10 rounded-2xl p-[2px] bg-gradient-to-br from-pink-400 via-purple-500 to-amber-400">
      <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
        <Home
          className="w-4 h-4 text-black"
          strokeWidth={2}
          absoluteStrokeWidth
        />
      </div>
    </div>
  );
}
