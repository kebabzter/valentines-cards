"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faHeart } from "@fortawesome/free-solid-svg-icons";

export function Navigation() {
  const pathname = usePathname();
  const isCreate = pathname === "/";
  const isWall = pathname === "/cards";

  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {!isCreate && (
        <Link
          href="/"
          className="rounded-xl border border-pink-200 bg-white/90 px-4 py-2.5 font-medium text-pink-800 shadow-sm hover:bg-pink-50 hover:border-pink-300 hover:shadow transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5 shrink-0" />
          <span>Create card</span>
        </Link>
      )}
      {!isWall && (
        <Link
          href="/cards"
          className="rounded-xl border border-pink-200 bg-white/90 px-4 py-2.5 font-medium text-pink-800 shadow-sm hover:bg-pink-50 hover:border-pink-300 hover:shadow transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0"
        >
          <FontAwesomeIcon icon={faHeart} className="w-3.5 h-3.5 shrink-0" />
          <span>View wall</span>
        </Link>
      )}
    </nav>
  );
}
