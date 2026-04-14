import { AppBranding } from "@/app/(auth)/_components/AppBranding";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="flex min-h-150 w-full max-w-4xl overflow-hidden rounded-xl bg-background shadow-lg">
        <div className="hidden w-1/2 flex-col items-center justify-center bg-secondary p-10 md:flex">
          <div className="flex flex-1 items-center justify-center">
            <AppBranding variant="light" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} taskhub. All Rights Reserved.
          </p>
        </div>
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
