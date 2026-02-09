"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export function MobileMenuButton() {
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    console.log('Mobile menu clicked, current sidebar state:', sidebarOpen);
    
    // Force open the sidebar
    setSidebarOpen(true);
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150);
    
    console.log('Sidebar should now be open');
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        lg:hidden 
        w-12 h-12 
        rounded-xl 
        bg-gradient-to-r from-[#2563eb] to-[#3b82f6] 
        hover:from-[#3b82f6] hover:to-[#2563eb] 
        border border-[#2563eb] 
        flex items-center justify-center 
        text-white 
        transition-all duration-200 
        shadow-lg shadow-[#2563eb]/30
        active:scale-95
        ${isPressed ? 'scale-95 shadow-lg shadow-[#2563eb]/50' : 'hover:scale-105'}
      `}
      aria-label="Open navigation menu"
      type="button"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}