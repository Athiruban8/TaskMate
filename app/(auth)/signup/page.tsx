"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/app/components/Logo";
import { EyeIcon, EyeSlashIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  // Success screen after signup
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-neutral-950">
        <div className="w-full max-w-md space-y-8 text-center">
          <Logo />
          <div className="mt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              We've sent a confirmation link to{" "}
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {email}
              </span>{" "}
              to verify your address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main signup form
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Logo />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-black transition-colors hover:underline dark:text-white"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-neutral-300 bg-white px-3 py-2 placeholder-neutral-400 shadow-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white"
                placeholder="Ada Lovelace"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-neutral-300 bg-white px-3 py-2 placeholder-neutral-400 shadow-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-neutral-300 bg-white px-3 py-2 pr-10 placeholder-neutral-400 shadow-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="6+ characters"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="sr-only">Toggle password visibility</span>
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-neutral-300 bg-white px-3 py-2 pr-10 placeholder-neutral-400 shadow-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="sr-only">Toggle password visibility</span>
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
