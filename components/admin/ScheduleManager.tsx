"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  deleteScheduleItemAction,
  reorderScheduleItemsAction,
  saveScheduleItemAction,
  type ScheduleActionState,
} from "@/app/actions/schedule";
import type { AdminScheduleItem } from "@/lib/content/schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/field-classes";
import { AdminItemList } from "@/components/admin/AdminItemList";

type IconOption = { value: string; label: string };

type ScheduleManagerProps = {
  items: AdminScheduleItem[];
  icons: IconOption[];
};

export function ScheduleManager({ items, icons }: ScheduleManagerProps) {
  const listItems = items.map((item) => ({
    ...item,
    title: `${item.time} · ${item.title}`,
    subtitle: item.highlight ? `${item.summary} · destaque` : item.summary,
  }));

  return (
    <AdminItemList
      items={listItems}
      noun="momento"
      addLabel="Adicionar momento"
      emptyLabel="Ainda não há momentos na programação."
      formHint="Horário, título, resumo e descrição são obrigatórios."
      onReorder={reorderScheduleItemsAction}
      onDelete={deleteScheduleItemAction}
      renderForm={(item, onDone) => (
        <ScheduleForm item={item} icons={icons} onDone={onDone} />
      )}
    />
  );
}

type ScheduleFormProps = {
  item?: AdminScheduleItem;
  icons: IconOption[];
  onDone: () => void;
};

function ScheduleForm({ item, icons, onDone }: ScheduleFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveScheduleItemAction,
    null as ScheduleActionState,
  );

  useEffect(() => {
    if (state?.ok) {
      onDone();
      router.refresh();
    }
  }, [state, onDone, router]);

  return (
    <form action={formAction} className="space-y-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <div className="space-y-2">
          <Label htmlFor="schedule-time">Horário</Label>
          <Input
            id="schedule-time"
            name="time"
            required
            maxLength={20}
            placeholder="16h30"
            defaultValue={item?.time}
            className={adminFieldClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule-title">Título</Label>
          <Input
            id="schedule-title"
            name="title"
            required
            defaultValue={item?.title}
            className={adminFieldClass}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="schedule-summary">Resumo</Label>
        <Input
          id="schedule-summary"
          name="summary"
          required
          defaultValue={item?.summary}
          className={adminFieldClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schedule-description">Descrição</Label>
        <textarea
          id="schedule-description"
          name="description"
          required
          defaultValue={item?.description}
          className={adminTextareaClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schedule-location">Local (opcional)</Label>
        <Input
          id="schedule-location"
          name="location"
          defaultValue={item?.location}
          className={adminFieldClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schedule-icon">Ícone</Label>
        <select
          id="schedule-icon"
          name="icon"
          required
          defaultValue={item?.icon ?? icons[0]?.value}
          className={adminFieldClass}
        >
          {icons.map((icon) => (
            <option key={icon.value} value={icon.value}>
              {icon.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="highlight"
          defaultChecked={item?.highlight}
          className="size-5 accent-olive"
        />
        Destacar este momento na linha do tempo
      </label>

      {state && !state.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 min-h-11 w-full bg-olive text-cream hover:bg-olive/90"
      >
        {pending ? "Salvando…" : "Salvar momento"}
      </Button>
    </form>
  );
}
