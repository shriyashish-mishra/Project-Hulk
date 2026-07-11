"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { deleteMyData } from "@/lib/profile/actions";

interface DeleteDataDrawerProps {
  trigger: ReactElement;
}

export function DeleteDataDrawer({ trigger }: DeleteDataDrawerProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteMyData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <DrawerHeader className="pt-2">
          <DrawerTitle className="text-2xl font-bold tracking-tight text-destructive">
            Delete my data
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-2 px-5 py-6">
          <p className="text-sm text-muted-foreground">
            This permanently deletes every meal, workout, hydration, sleep,
            weight, and progress-photo entry, every coach report, and your
            profile. You&rsquo;ll be signed out and land back at onboarding.
            This cannot be undone.
          </p>
          <p className="text-xs text-muted-foreground">
            Your login itself is not deleted — you can sign back in and start
            fresh.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DrawerFooter className="px-5 pb-6">
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting…" : "Yes, delete everything"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
