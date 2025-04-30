'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">XenAI</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`text-sm ${pathname === '/' ? 'text-white' : 'text-white/70 hover:text-white'} transition-colors`}>
            Home
          </Link>
          <Link href="/dashboard" className={`text-sm ${pathname === '/dashboard' ? 'text-white' : 'text-white/70 hover:text-white'} transition-colors`}>
            Dashboard
          </Link>
          <Link href="/workspace" className={`text-sm ${pathname.startsWith('/workspace') ? 'text-white' : 'text-white/70 hover:text-white'} transition-colors`}>
            Workspace
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}