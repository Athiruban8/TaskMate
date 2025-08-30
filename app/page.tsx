"use client";
import Link from "next/link";
import {
  ArrowRightIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { Logo } from "../components/Logo";

// A reusable, animated button component
interface MotionLinkButtonProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

const MotionLinkButton = ({
  href,
  className,
  children,
}: MotionLinkButtonProps) => (
  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
    <Link href={href} className={className}>
      {children}
    </Link>
  </motion.div>
);

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: CodeBracketIcon,
      title: "For Developers",
      description:
        "Find exciting projects that match your stack. Collaborate on open-source, build your portfolio, or find your next startup co-founder.",
    },
    {
      icon: PaintBrushIcon,
      title: "For Designers",
      description:
        "Lend your creative expertise to new apps, websites, and brands. Work with developers to create beautiful, user-centric products.",
    },
    {
      icon: UsersIcon,
      title: "For Everyone",
      description:
        "Have a great idea but need a team? Post your project and connect with skilled individuals who can help bring your vision to life.",
    },
  ];

  // Animation for Framer Motion
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white text-neutral-800 antialiased dark:bg-neutral-950 dark:text-neutral-200">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80" : "bg-transparent"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                Sign In
              </Link>
              <MotionLinkButton
                href="/signup"
                className="rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Get Started
              </MotionLinkButton>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 text-center sm:py-32">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.1 }}
            className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
          >
            <motion.h1
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold tracking-tighter text-neutral-900 md:text-6xl dark:text-white"
            >
              Where Great Ideas
              <br />
              Find Great Teams
            </motion.h1>
            <motion.p
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400"
            >
              TaskMate is the collaboration platform for builders, creators, and
              dreamers. Share your vision, find your crew, and build something
              amazing together.
            </motion.p>
            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <MotionLinkButton
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-black px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Start a Project
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </MotionLinkButton>
              <MotionLinkButton
                href="/projects"
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-transparent px-5 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Explore Ideas
              </MotionLinkButton>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="bg-neutral-50 py-24 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                A Space for Every Skill
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600 dark:text-neutral-400">
                Whether you write code, design interfaces, or manage products,
                TaskMate is your platform to connect and create.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  custom={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow duration-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:shadow-black/20"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                    <feature.icon className="h-6 w-6 text-neutral-800 dark:text-neutral-200" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Ready to build the future?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Join a growing community of innovators. Your next great project is
              just a click away.
            </p>
            <div className="mt-8">
              <MotionLinkButton
                href="/signup"
                className="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Get Started for Free
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </MotionLinkButton>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="py-5 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            TaskMate •{" "}
            <a
              href="https://github.com/Athiruban8"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-black dark:hover:text-white"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
