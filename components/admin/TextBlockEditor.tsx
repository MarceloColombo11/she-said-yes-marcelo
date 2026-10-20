"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveTextBlockAction,
  type TextActionState,
} from "@/app/actions/texts";
import type { BlockValue, FieldDef } from "@/lib/content/text-blocks";
import { publicMediaUrl } from "@/lib/site-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/field-classes";
import { uploadSiteImage } from "@/components/admin/upload-site-image";

type TextBlockEditorProps = {
  blockKey: string;
  title: string;
  hint: string;
  fields: FieldDef[];
  value: BlockValue;
};

function asList(value: BlockValue[string]): string[] {
  return Array.isArray(value) && value.length > 0 ? value : [""];
}

export function TextBlockEditor({
  blockKey,
  title,
  hint,
  fields,
  value,
}: TextBlockEditorProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    saveTextBlockAction,
    null as TextActionState,
  );
  const [lists, setLists] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      fields
        .filter((field) => field.kind === "paragraphs")
        .map((field) => [field.name, asList(value[field.name])]),
    ),
  );
  const [media, setMedia] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields
        .filter((field) => field.kind === "media")
        .map((field) => [field.name, String(value[field.name] ?? "")]),
    ),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  function setListItem(name: string, index: number, text: string) {
    setLists((prev) => {
      const next = [...(prev[name] ?? [""])];
      next[index] = text;
      return { ...prev, [name]: next };
    });
  }

  async function onMediaFile(name: string, file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const mediaId = await uploadSiteImage(file);
      setMedia((prev) => ({ ...prev, [name]: mediaId }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="space-y-4 border border-sage/30 p-4">
      <input type="hidden" name="key" value={blockKey} />
      <div>
        <h2 className="font-heading text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-olive/70">{hint}</p>
      </div>

      {fields.map((field) => {
        const id = `${blockKey}-${field.name}`;
        const label = `${field.label}${field.required ? "" : " (opcional)"}`;

        if (field.kind === "paragraphs") {
          const items = lists[field.name] ?? [""];
          return (
            <fieldset key={field.name} className="space-y-3">
              <legend className="text-sm font-medium">{label}</legend>
              {field.hint ? (
                <p className="text-xs text-olive/60">{field.hint}</p>
              ) : null}
              {items.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`${id}-${index}`} className="sr-only">
                    {field.label} {index + 1}
                  </Label>
                  <textarea
                    id={`${id}-${index}`}
                    name={field.name}
                    value={item}
                    onChange={(event) =>
                      setListItem(field.name, index, event.target.value)
                    }
                    className={adminTextareaClass}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-h-11"
                    disabled={items.length <= 1}
                    onClick={() =>
                      setLists((prev) => ({
                        ...prev,
                        [field.name]: items.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-11 min-h-11"
                onClick={() =>
                  setLists((prev) => ({ ...prev, [field.name]: [...items, ""] }))
                }
              >
                Adicionar
              </Button>
            </fieldset>
          );
        }

        if (field.kind === "media") {
          const mediaId = media[field.name] ?? "";
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <input type="hidden" name={field.name} value={mediaId} />
              {mediaId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicMediaUrl(mediaId)}
                  alt=""
                  className="size-24 rounded-full border border-sage/30 object-cover"
                />
              ) : (
                <p className="text-sm text-olive/60">Nenhuma imagem.</p>
              )}
              <input
                id={id}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={adminFieldClass}
                disabled={uploading || pending}
                onChange={(event) => onMediaFile(field.name, event.target.files?.[0])}
              />
              {mediaId && !field.required ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 min-h-11"
                  onClick={() => setMedia((prev) => ({ ...prev, [field.name]: "" }))}
                >
                  Remover imagem
                </Button>
              ) : null}
            </div>
          );
        }

        const defaultValue = String(value[field.name] ?? "");
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {field.kind === "textarea" ? (
              <textarea
                id={id}
                name={field.name}
                required={field.required}
                maxLength={field.max}
                defaultValue={defaultValue}
                className={adminTextareaClass}
              />
            ) : (
              <Input
                id={id}
                name={field.name}
                type={
                  field.kind === "datetime"
                    ? "datetime-local"
                    : field.kind === "url"
                      ? "url"
                      : "text"
                }
                required={field.required}
                maxLength={field.max}
                defaultValue={defaultValue}
                className={adminFieldClass}
              />
            )}
            {field.hint ? (
              <p className="text-xs text-olive/60">{field.hint}</p>
            ) : null}
          </div>
        );
      })}

      {uploadError ? (
        <p className="text-sm text-red-700" role="alert">
          {uploadError}
        </p>
      ) : null}
      {state && !state.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-olive/80">Atualizado no site.</p>
      ) : null}

      <Button
        type="submit"
        disabled={pending || uploading}
        className="h-11 min-h-11 w-full bg-olive text-cream hover:bg-olive/90 sm:w-auto"
      >
        {pending ? "Salvando…" : uploading ? "Enviando foto…" : "Salvar"}
      </Button>
    </form>
  );
}
