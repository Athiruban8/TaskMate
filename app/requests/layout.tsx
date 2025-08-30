import Navigation from "@/components/NavBar";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
