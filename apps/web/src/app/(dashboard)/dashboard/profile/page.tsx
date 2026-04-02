import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import { redirect } from "next/navigation";
import type { GetMeQuery } from "@/graphql/generated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const token = await getSession();
  if (!token) redirect("/login");

  type UserData = GetMeQuery["me"];
  let user: UserData | null = null;

  try {
    const data = await getSdkClient(token).GetMe();
    user = data.me;
  } catch {
    // API down or expired
  }

  if (!user) {
    return (
      <p className="text-muted-foreground">
        Unable to load profile. Please try again.
      </p>
    );
  }

  const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details
        </p>
      </div>

      <Card>
        <CardContent className="px-6 py-5 space-y-5">
          {/* Avatar initial */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">{user.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Details */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-1">
                <Badge
                  variant={user.role === "ADMIN" ? "default" : "secondary"}
                >
                  {user.role === "ADMIN" ? "Admin" : "User"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="mt-1 font-medium">{joined}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="mt-1 font-mono text-xs text-muted-foreground truncate">
                {user.id}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
