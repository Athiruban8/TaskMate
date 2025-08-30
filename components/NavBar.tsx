"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import {
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  FolderIcon,
  InboxStackIcon,
  Squares2X2Icon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./Logo";

// Hook to handle clicks outside of a component
const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export default function Navigation() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setIsProfileOpen(false));
  useClickOutside(mobileMenuRef, () => setIsMobileMenuOpen(false));

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navLinks = [
    { name: "Projects", href: "/projects", icon: Squares2X2Icon },
    { name: "My Projects", href: "/my-projects", icon: FolderIcon },
    { name: "Requests", href: "/requests", icon: InboxStackIcon },
    { name: "Chats", href: "/chats", icon: EnvelopeIcon },
  ];

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const isActive = pathname === href;
    return (
      <a
        href={href}
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "text-black dark:text-white"
            : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        }`}
      >
        {children}
      </a>
    );
  };

  const ProfileMenu = () => (
    <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="py-1">
        <div className="px-4 py-3">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {user?.user_metadata?.name || "User"}
          </p>
          <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
            {user?.email}
          </p>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800" />
        <a
          href="/profile"
          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <UserCircleIcon className="h-5 w-5" />
          Your Profile
        </a>
        {/* <a
          href="/settings"
          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          Settings
        </a> */}
        <div className="border-t border-neutral-200 dark:border-neutral-800" />
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-800"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );

  const MobileMenu = () => (
    <div
      ref={mobileMenuRef}
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-neutral-950 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
        <Logo />
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 text-neutral-500 dark:text-neutral-400"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="p-4">
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium ${pathname === link.href ? "bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </a>
          ))}
        </nav>
        <div className="my-4 border-t border-neutral-200 dark:border-neutral-800" />
        <div className="space-y-2">
          <a
            href="/profile"
            className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <UserCircleIcon className="h-5 w-5" /> Your Profile
          </a>
          <a
            href="/settings"
            className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Cog6ToothIcon className="h-5 w-5" /> Settings
          </a>
          <button
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-800"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg dark:bg-neutral-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center space-x-2 md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />

              <button className="hidden cursor-pointer rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black sm:block dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                <BellIcon className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex cursor-pointer items-center space-x-2 rounded-full p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    {/* Placeholder for User avatar */}
                    <UserCircleIcon className="h-7 w-7 text-neutral-500 dark:text-neutral-400" />
                  </div>
                </button>
                {isProfileOpen && <ProfileMenu />}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && <MobileMenu />}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
