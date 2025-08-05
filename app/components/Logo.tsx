import Link from "next/link";

export const Logo = () => (
  <Link href="/" className="flex items-center justify-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white">
      <div className="h-4 w-4 rotate-45 transform rounded-sm bg-white dark:bg-black" />
    </div>
    <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
      TaskMate
    </h1>
  </Link>
);
