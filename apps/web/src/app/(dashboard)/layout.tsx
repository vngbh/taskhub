import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { NavLinks } from "@/app/(dashboard)/NavLinks";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="taskhub logo"
                width={22}
                height={22}
                loading="eager"
                className="dark:invert"
              />
              <span className="text-sm font-semibold tracking-tight">
                taskhub
              </span>
            </Link>
            <NavLinks />
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
