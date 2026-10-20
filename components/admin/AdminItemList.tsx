"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActionResult = { ok: true } | { ok: false; error: string } | null;

export type AdminListItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  fallback?: ReactNode;
};

type AdminItemListProps<T extends AdminListItem> = {
  items: T[];
  noun: string;
  addLabel: string;
  emptyLabel: string;
  formHint: string;
  onReorder: (ids: string[]) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  renderForm: (item: T | undefined, onDone: () => void) => ReactNode;
};

/** Lista ordenável com criar, editar e remover em diálogos. */
export function AdminItemList<T extends AdminListItem>({
  items,
  noun,
  addLabel,
  emptyLabel,
  formHint,
  onReorder,
  onDelete,
  renderForm,
}: AdminItemListProps<T>) {
  const router = useRouter();
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<ActionResult>): Promise<boolean> {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result && !result.ok) {
      setError(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const ids = items.map((item) => item.id);
    const [removed] = ids.splice(index, 1);
    ids.splice(next, 0, removed);
    void run(() => onReorder(ids));
  }

  async function confirmDelete() {
    if (!toDelete) return;
    if (await run(() => onDelete(toDelete.id))) setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        className="h-11 min-h-11 w-full bg-olive text-cream hover:bg-olive/90 sm:w-auto"
        onClick={() => setCreating(true)}
      >
        {addLabel}
      </Button>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="text-olive/70">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 border border-sage/30 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="size-14 shrink-0 rounded-full object-cover"
                  />
                ) : item.fallback ? (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sage/20 text-olive">
                    {item.fallback}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold break-words">
                    {item.title}
                  </p>
                  {item.subtitle ? (
                    <p className="text-sm text-olive/60 break-words">{item.subtitle}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11"
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Subir"
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11"
                  disabled={busy || index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Descer"
                >
                  <ChevronDown />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 min-h-11"
                  onClick={() => setEditing(item)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 min-h-11"
                  onClick={() => setToDelete(item)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-olive">{addLabel}</DialogTitle>
            <DialogDescription>{formHint}</DialogDescription>
          </DialogHeader>
          {creating ? renderForm(undefined, () => setCreating(false)) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-olive">Editar {noun}</DialogTitle>
            <DialogDescription>
              As alterações aparecem no site em até um minuto.
            </DialogDescription>
          </DialogHeader>
          {editing ? renderForm(editing, () => setEditing(null)) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-olive">Remover {noun}?</DialogTitle>
            <DialogDescription>
              Some do site de vez. Não dá para desfazer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 min-h-11"
              onClick={() => setToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11 min-h-11"
              disabled={busy}
              onClick={confirmDelete}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
