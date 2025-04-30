"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Settings, HelpCircle, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/config/firebase";

const DashboardNavbar = () => {
  const router = useRouter();
  const user = auth.currentUser;

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-gray-800 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Xen.ai</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="h-8 w-px bg-gray-800" />
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || "/robotic.png"} />
            <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;