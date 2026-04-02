"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

export function TermsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          Terms &amp; Conditions
        </button>
      </DialogPrimitive.Trigger>

      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4">
          <DialogPrimitive.Content className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg outline-none">
            <DialogPrimitive.Title className="text-center mb-6 font-semibold leading-none">
              Terms &amp; Conditions
            </DialogPrimitive.Title>
            <div className="space-y-5 text-xs leading-relaxed text-muted-foreground">
              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using taskhub, you agree to be bound by these
                  Terms &amp; Conditions. If you do not agree with any part of
                  these terms, please do not use the service.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  2. Use of Service
                </h3>
                <p>
                  taskhub is a personal productivity tool. You are responsible
                  for maintaining the confidentiality of your account
                  credentials and for all activity that occurs under your
                  account. You agree not to use the service for any unlawful
                  purpose.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  3. Data We Collect
                </h3>
                <p>
                  We collect and store only the information necessary to provide
                  the service:
                </p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Your name and email address (used for authentication)</li>
                  <li>Task data you create within the app</li>
                  <li>Session tokens stored as secure, HTTP-only cookies</li>
                </ul>
                <p>
                  We do not sell, share, or disclose your personal data to third
                  parties.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  4. Data Security
                </h3>
                <p>
                  Passwords are hashed using industry-standard algorithms and
                  are never stored in plain text. All data in transit is
                  encrypted via HTTPS. Despite our efforts, no method of
                  transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  5. Data Retention &amp; Deletion
                </h3>
                <p>
                  Your data is retained for as long as your account remains
                  active. You may request deletion of your account and all
                  associated data at any time by contacting us.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  6. Changes to These Terms
                </h3>
                <p>
                  We may update these terms from time to time. Continued use of
                  the service after changes are posted constitutes your
                  acceptance of the revised terms.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-foreground">7. Contact</h3>
                <p>
                  If you have any questions about these terms or your data,
                  please reach out via the contact details provided in the app.
                </p>
              </section>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
