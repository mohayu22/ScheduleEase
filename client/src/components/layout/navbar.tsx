import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user-context";
import { Menu, Bell, X } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">SchedulEase</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard">
                <a className={`${
                  isActive("/") || isActive("/dashboard")
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/availability">
                <a className={`${
                  isActive("/availability")
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  Availability
                </a>
              </Link>
              <Link href="/booking-page">
                <a className={`${
                  isActive("/booking-page")
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  Booking Page
                </a>
              </Link>
              <Link href="/settings">
                <a className={`${
                  isActive("/settings")
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  Settings
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="sr-only">View notifications</span>
            </Button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <Link href="/settings">
                  <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">Open user menu</span>
                    <Avatar>
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : "User"}</AvatarFallback>
                    </Avatar>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-400" />
              ) : (
                <Menu className="h-6 w-6 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/dashboard">
            <a className={`${
              isActive("/") || isActive("/dashboard")
                ? "bg-primary-50 border-primary text-primary-700"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Dashboard
            </a>
          </Link>
          <Link href="/availability">
            <a className={`${
              isActive("/availability")
                ? "bg-primary-50 border-primary text-primary-700"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Availability
            </a>
          </Link>
          <Link href="/booking-page">
            <a className={`${
              isActive("/booking-page")
                ? "bg-primary-50 border-primary text-primary-700"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Booking Page
            </a>
          </Link>
          <Link href="/settings">
            <a className={`${
              isActive("/settings")
                ? "bg-primary-50 border-primary text-primary-700"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Settings
            </a>
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarImage src={user?.profileImage} alt={user?.name} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "User"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{user?.name}</div>
              <div className="text-sm font-medium text-gray-500">{user?.email}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Link href="/settings">
              <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Your Profile
              </a>
            </Link>
            <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
              Sign out
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
