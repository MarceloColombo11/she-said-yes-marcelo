"use client";

import { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizePersonName } from "@/lib/content/guest-name";

type Suggestion = { id: string; fullName: string };

type GuestNameFieldProps = {
  id: string;
  value: string;
  error: string | null;
  disabled?: boolean;
  onChange: (name: string, guestId: string | null) => void;
};

/** Campo de nome com sugestões da lista de convidados. */
export const GuestNameField = forwardRef<HTMLInputElement, GuestNameFieldProps>(
  function GuestNameField({ id, value, error, disabled, onChange }, ref) {
    const [results, setResults] = useState<{ query: string; items: Suggestion[] }>({
      query: "",
      items: [],
    });
    const [selected, setSelected] = useState<Suggestion | null>(null);
    const isSelected = selected !== null && value === selected.fullName;
    const searchable = !isSelected && normalizePersonName(value).length >= 2;

    useEffect(() => {
      if (!searchable) return;
      const controller = new AbortController();
      const handle = window.setTimeout(() => {
        fetch(`/api/rsvp/suggest?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        })
          .then((response) => response.json() as Promise<{ guests?: Suggestion[] }>)
          .then((data) =>
            setResults({
              query: value,
              items: Array.isArray(data.guests) ? data.guests : [],
            }),
          )
          .catch(() => {
            if (!controller.signal.aborted) setResults({ query: value, items: [] });
          });
      }, 200);
      return () => {
        controller.abort();
        window.clearTimeout(handle);
      };
    }, [value, searchable]);

    const suggestions = searchable && results.query === value ? results.items : [];
    const errorId = `${id}-error`;

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>Nome completo *</Label>
        <Input
          ref={ref}
          id={id}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            if (!selected || next !== selected.fullName) {
              setSelected(null);
              onChange(next, null);
            } else {
              onChange(next, selected.id);
            }
          }}
          placeholder="Nome e sobrenome"
          autoComplete="name"
          required
          disabled={disabled}
          className="min-h-11"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-autocomplete="list"
        />
        {suggestions.length > 0 ? (
          <ul
            className="overflow-hidden rounded-md border border-olive/20 bg-white"
            aria-label="Sugestões da lista de convidados"
          >
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="min-h-11 w-full px-3 py-2 text-left text-sm text-brown hover:bg-sage/10"
                  onClick={() => {
                    setSelected(item);
                    onChange(item.fullName, item.id);
                  }}
                >
                  {item.fullName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {error ? (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
