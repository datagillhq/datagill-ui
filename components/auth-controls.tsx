"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            Sign in
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-xl border-border/70 bg-muted/95 p-0 shadow-2xl shadow-black/10"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in to your DataGill account.
          </DialogDescription>
          <div className="flex min-h-[540px] flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
              <div className="flex items-center gap-2 self-center font-medium">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                datagill
              </div>
              <LoginForm />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary">
            Sign up
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-xl border-border/70 bg-muted/95 p-0 shadow-2xl shadow-black/10"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Sign up</DialogTitle>
          <DialogDescription className="sr-only">
            Create your DataGill account.
          </DialogDescription>
          <div className="flex min-h-[540px] flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
              <div className="flex items-center gap-2 self-center font-medium">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                datagill
              </div>
              <SignupForm />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
