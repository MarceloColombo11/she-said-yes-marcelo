"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  deleteHonorPersonAction,
  reorderHonorPeopleAction,
  saveHonorPersonAction,
  type HonorActionState,
} from "@/app/actions/honor-people";
import type { AdminHonorPerson, HonorCategory } from "@/lib/content/honor-people";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/field-classes";
import { uploadSiteImage } from "@/components/admin/upload-site-image";
import { AdminItemList } from "@/components/admin/AdminItemList";

const DEFAULT_ZOOM = 1.75;

type HonorPeopleManagerProps = {
  categories: { value: HonorCategory; label: string }[];
  people: AdminHonorPerson[];
};

export function HonorPeopleManager({ categories, people }: HonorPeopleManagerProps) {
  const [category, setCategory] = useState<HonorCategory>(categories[0].value);
  const current = categories.find((item) => item.value === category) ?? categories[0];
  const items = people
    .filter((person) => person.category === category)
    .map((person) => ({
      ...person,
      title: person.name,
      subtitle: person.text.length > 90 ? `${person.text.slice(0, 90)}…` : person.text,
      fallback: <span className="font-heading text-xl">{person.name.charAt(0)}</span>,
    }));

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Categoria" className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={item.value === category}
            variant={item.value === category ? "default" : "outline"}
            className={cn(
              "h-11 min-h-11",
              item.value === category && "bg-olive text-cream hover:bg-olive/90",
            )}
            onClick={() => setCategory(item.value)}
          >
            {item.label} ({people.filter((p) => p.category === item.value).length})
          </Button>
        ))}
      </div>

      <AdminItemList
        key={category}
        items={items}
        noun="pessoa"
        addLabel={`Adicionar em ${current.label}`}
        emptyLabel="Ninguém nesta lista ainda. A seção fica escondida no site."
        formHint="Nome e texto são obrigatórios. A foto é opcional."
        onReorder={(ids) => reorderHonorPeopleAction(category, ids)}
        onDelete={deleteHonorPersonAction}
        renderForm={(person, onDone) => (
          <HonorPersonForm
            category={category}
            categories={categories}
            person={person}
            onDone={onDone}
          />
        )}
      />
    </div>
  );
}

type HonorPersonFormProps = {
  category: HonorCategory;
  categories: { value: HonorCategory; label: string }[];
  person?: AdminHonorPerson;
  onDone: () => void;
};

function HonorPersonForm({ category, categories, person, onDone }: HonorPersonFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveHonorPersonAction,
    null as HonorActionState,
  );
  const [mediaId, setMediaId] = useState(person?.mediaId ?? "");
  const [preview, setPreview] = useState(person?.imageUrl ?? "");
  const [zoom, setZoom] = useState(person?.photoZoom ?? DEFAULT_ZOOM);
  const [offsetY, setOffsetY] = useState(person?.photoOffsetY ?? 0);
  const [position, setPosition] = useState(person?.photoObjectPosition ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok) {
      onDone();
      router.refresh();
    }
  }, [state, onDone, router]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const id = await uploadSiteImage(file);
      setMediaId(id);
      setPreview(URL.createObjectURL(file));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Não foi possível enviar a foto.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {person ? <input type="hidden" name="id" value={person.id} /> : null}
      <input type="hidden" name="mediaId" value={mediaId} />

      <div className="space-y-2">
        <Label htmlFor="honor-category">Lista</Label>
        <select
          id="honor-category"
          name="category"
          defaultValue={person?.category ?? category}
          className={adminFieldClass}
        >
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="honor-name">Nome</Label>
        <Input
          id="honor-name"
          name="name"
          required
          defaultValue={person?.name}
          className={adminFieldClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="honor-text">Texto</Label>
        <textarea
          id="honor-text"
          name="text"
          required
          defaultValue={person?.text}
          className={`${adminTextareaClass} min-h-40`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="honor-photo">Foto (opcional, até 4 MB)</Label>
        <Input
          id="honor-photo"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={adminFieldClass}
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        {uploading ? <p className="text-sm text-olive/70">Enviando foto…</p> : null}
        {uploadError ? (
          <p className="text-sm text-red-700" role="alert">
            {uploadError}
          </p>
        ) : null}
      </div>

      {preview ? (
        <div className="space-y-4 border border-sage/30 p-4">
          <div className="flex items-center gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-sage/30">
              <div
                className="size-full origin-center"
                style={{ transform: `scale(${zoom}) translateY(${offsetY}%)` }}
              >
                <Image
                  src={preview}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="size-full object-cover"
                  style={{ objectPosition: position || "center center" }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-olive/70">Assim aparece no site.</p>
              <Button
                type="button"
                variant="ghost"
                className="h-11 min-h-11"
                onClick={() => {
                  setMediaId("");
                  setPreview("");
                }}
              >
                Remover foto
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="honor-zoom">Zoom ({zoom.toFixed(2)}×)</Label>
            <input
              id="honor-zoom"
              name="photoZoom"
              type="range"
              min={0.5}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-olive"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="honor-offset">Subir / descer ({offsetY}%)</Label>
            <input
              id="honor-offset"
              name="photoOffsetY"
              type="range"
              min={-50}
              max={50}
              step={1}
              value={offsetY}
              onChange={(event) => setOffsetY(Number(event.target.value))}
              className="w-full accent-olive"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="honor-position">Enquadramento (opcional)</Label>
            <Input
              id="honor-position"
              name="photoObjectPosition"
              value={position}
              maxLength={40}
              placeholder="center 35%"
              onChange={(event) => setPosition(event.target.value)}
              className={adminFieldClass}
            />
          </div>
        </div>
      ) : null}

      {state && !state.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending || uploading}
        className="h-11 min-h-11 w-full bg-olive text-cream hover:bg-olive/90"
      >
        {pending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
