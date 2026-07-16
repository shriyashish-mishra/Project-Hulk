"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface PresetItem {
  id: string;
  raw_text: string;
}

interface PresetPickerDrawerProps {
  trigger: ReactElement;
  title: string;
  emptyLabel: string;
  addPlaceholder: string;
  presets: PresetItem[];
  onSelect: (rawText: string) => void;
  onCreate: (rawText: string) => Promise<PresetItem>;
  onUpdate: (id: string, rawText: string) => Promise<PresetItem>;
  onDelete: (id: string) => Promise<void>;
}

export function PresetPickerDrawer({
  trigger,
  title,
  emptyLabel,
  addPlaceholder,
  presets,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: PresetPickerDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSessionKey((key) => key + 1);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <PresetPickerBody
          key={sessionKey}
          title={title}
          emptyLabel={emptyLabel}
          addPlaceholder={addPlaceholder}
          initialPresets={presets}
          onSelect={onSelect}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

interface PresetPickerBodyProps {
  title: string;
  emptyLabel: string;
  addPlaceholder: string;
  initialPresets: PresetItem[];
  onSelect: (rawText: string) => void;
  onCreate: (rawText: string) => Promise<PresetItem>;
  onUpdate: (id: string, rawText: string) => Promise<PresetItem>;
  onDelete: (id: string) => Promise<void>;
  onDone: () => void;
}

function PresetPickerBody({
  title,
  emptyLabel,
  addPlaceholder,
  initialPresets,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  onDone,
}: PresetPickerBodyProps) {
  const [presets, setPresets] = useState(initialPresets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditorOpen = adding || editingId !== null;

  function startEdit(preset: PresetItem) {
    setEditingId(preset.id);
    setAdding(false);
    setDraft(preset.raw_text);
    setError(null);
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setDraft("");
    setError(null);
  }

  function cancelEditor() {
    setAdding(false);
    setEditingId(null);
    setDraft("");
    setError(null);
  }

  function handleSaveDraft() {
    if (!draft.trim()) {
      setError("Write something first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (editingId) {
          const updated = await onUpdate(editingId, draft);
          setPresets((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        } else {
          const created = await onCreate(draft);
          setPresets((prev) => [...prev, created]);
        }
        cancelEditor();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        await onDelete(id);
        setPresets((prev) => prev.filter((p) => p.id !== id));
        if (editingId === id) cancelEditor();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  function handlePick(rawText: string) {
    onSelect(rawText);
    onDone();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">{title}</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-2 overflow-y-auto px-5 py-5">
        {presets.length === 0 && !isEditorOpen && (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}

        {presets.map((preset) =>
          editingId === preset.id ? (
            <div
              key={preset.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/50 p-3"
            >
              <Textarea
                autoFocus
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-24 resize-none"
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={isPending} onClick={handleSaveDraft}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={cancelEditor}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={preset.id}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <button
                type="button"
                onClick={() => handlePick(preset.raw_text)}
                className="min-w-0 flex-1 text-left active:opacity-60"
              >
                <p className="line-clamp-2 whitespace-pre-line text-[15px] text-foreground">
                  {preset.raw_text}
                </p>
              </button>
              <button
                type="button"
                aria-label="Edit"
                onClick={() => startEdit(preset)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:opacity-60"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Delete"
                disabled={isPending}
                onClick={() => handleDelete(preset.id)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:opacity-60"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ),
        )}

        {adding && (
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/50 p-3">
            <Textarea
              autoFocus
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={addPlaceholder}
              className="min-h-24 resize-none"
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={isPending} onClick={handleSaveDraft}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={cancelEditor}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {!isEditorOpen && (
        <DrawerFooter className="px-5 pb-6">
          <Button type="button" variant="outline" onClick={startAdd}>
            <Plus className="size-4" />
            Add
          </Button>
        </DrawerFooter>
      )}
    </div>
  );
}
