import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "@/app/(dashboard)/_components/NavLinks";
import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userName = "";
  try {
    const token = await getSession();
    if (token) {
      const { me } = await getSdkClient(token).GetMe();
      userName = me.name;
    }
  } catch {
    // ignore
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background shadow">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center justify-center gap-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="taskhub logo"
                width={22}
                height={22}
                loading="eager"
                className="dark:invert"
              />
              <span className="text-xl font-bold tracking-tight">taskhub</span>
            </Link>
            <NavLinks />
          </div>
          <Link
            href="/dashboard/profile"
            aria-label="Profile"
            className="flex items-center rounded-md p-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-zinc-900 text-[9px] text-white dark:bg-zinc-100 dark:text-zinc-900">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>
      <footer className="bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-6 pb-8 pt-24 text-xs text-neutral-400">
          <span>
            The source code is available on{" "}
            <a
              href="https://github.com/vngbh/taskhub"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            .
          </span>
        </div>
      </footer>
    </div>
  );
}
