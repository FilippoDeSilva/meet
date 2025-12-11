'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import MobileNav from './MobileNav';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/logo.svg"
          width={32}
          height={32}
          alt="yoom logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          YOOM
        </p>
      </Link>
      <div className="flex-between gap-5">
        {user && (
          <button
            onClick={signOut}
            className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/50 active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
