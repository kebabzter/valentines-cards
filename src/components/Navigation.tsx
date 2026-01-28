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
    <nav className="flex gap-2 text-sm">
      {!isCreate && (
        <Link
          href="/"
          className="rounded-full border border-pink-300 bg-white/70 px-3 py-1.5 font-medium text-pink-800 hover:bg-pink-50 transition-colors flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          <span>Create card</span>
        </Link>
      )}
      {!isWall && (
        <Link
          href="/cards"
          className="rounded-full border border-pink-300 bg-white/70 px-3 py-1.5 font-medium text-pink-800 hover:bg-pink-50 transition-colors flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faHeart} className="w-3 h-3" />
          <span>View wall</span>
        </Link>
      )}
    </nav>
  );
}
