'use client';

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          WTLO
        </Link>
        <div className="flex gap-4">
          <Link href="/" className="text-white">
            Home
          </Link>
          <Link href="/map" className="text-white">
            Map
          </Link>
          <Link href="/database" className="text-white">
            Database
          </Link>
        </div>
      </div>
    </nav>
  );
}
