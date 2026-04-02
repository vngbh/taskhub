import { AppBranding } from "@/components/custom/AppBranding";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="flex min-h-150 w-full max-w-4xl overflow-hidden rounded-xl bg-background shadow-lg">
        <div className="hidden w-1/2 flex-col items-center justify-center bg-zinc-900 p-10 md:flex">
          <AppBranding variant="dark" />
        </div>
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
