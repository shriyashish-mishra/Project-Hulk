"use client";

import { useState, type ReactElement } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface ExerciseActionsDrawerProps {
  trigger: ReactElement;
  exerciseName: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

/**
 * The kebab menu's contents — reorder as "Move up / Move down" rather than
 * drag handles, matching the mobile app's same tradeoff: no drag-and-drop
 * library needed for a fully working reorder.
 */
export function ExerciseActionsDrawer({
  trigger,
  exerciseName,
  canMoveUp,
  canMoveDown,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ExerciseActionsDrawerProps) {
  const [open, setOpen] = useState(false);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <DrawerHeader className="pt-2">
          <DrawerTitle className="text-2xl font-bold tracking-tight">{exerciseName}</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter className="gap-2 px-5 pb-6">
          <Button type="button" variant="secondary" onClick={() => run(onEdit)}>
            <Pencil className="size-4" />
            Edit defaults
          </Button>
          <Button type="button" variant="secondary" disabled={!canMoveUp} onClick={() => run(onMoveUp)}>
            <ArrowUp className="size-4" />
            Move up
          </Button>
          <Button type="button" variant="secondary" disabled={!canMoveDown} onClick={() => run(onMoveDown)}>
            <ArrowDown className="size-4" />
            Move down
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="text-destructive hover:text-destructive"
            onClick={() => run(onRemove)}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
