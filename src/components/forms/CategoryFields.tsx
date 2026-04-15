'use client';

import { useEffect, useState } from 'react';
import { TextField } from './TextField';
import type { CategoryFieldDef } from '@/lib/wp';

const REST_BASE = `${process.env.NEXT_PUBLIC_WP_REST}/rwa/v1`;

interface CategoryFieldsProps {
  categorySlug: string;
}

/**
 * Fetches CL Pro "Listing details" custom field definitions for the chosen
 * category (e.g. Cars → make, model) and renders them as form inputs.
 * Gracefully hides itself when the plugin endpoint is absent or returns nothing.
 * Field values are submitted as `fields[<key>]` so the backend can read them
 * into the listing's custom field meta.
 */
export function CategoryFields({ categorySlug }: CategoryFieldsProps) {
  const [fields, setFields] = useState<CategoryFieldDef[] | null>(null);

  useEffect(() => {
    if (!categorySlug) {
      setFields(null);
      return;
    }
    let cancelled = false;
    fetch(`${REST_BASE}/category-fields/${encodeURIComponent(categorySlug)}`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? (res.json() as Promise<CategoryFieldDef[]>) : []))
      .then((data) => {
        if (!cancelled) setFields(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFields([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  if (!fields || fields.length === 0) return null;

  const grouped = groupByGroup(fields);

  return (
    <div className="space-y-5">
      {grouped.map((group) => (
        <fieldset key={group.name} className="space-y-4">
          <legend className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
            {group.name}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.fields.map((field) => (
              <DynamicField key={field.key} field={field} />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

interface Group {
  name: string;
  fields: CategoryFieldDef[];
}

function groupByGroup(fields: CategoryFieldDef[]): Group[] {
  const order: string[] = [];
  const buckets = new Map<string, CategoryFieldDef[]>();
  for (const f of fields) {
    const name = f.group?.trim() || 'Listing details';
    if (!buckets.has(name)) {
      buckets.set(name, []);
      order.push(name);
    }
    buckets.get(name)!.push(f);
  }
  return order.map((name) => ({ name, fields: buckets.get(name)! }));
}

function DynamicField({ field }: { field: CategoryFieldDef }) {
  const name = `fields[${field.key}]`;

  if (field.type === 'select' && field.options && field.options.length > 0) {
    return (
      <div>
        <label
          htmlFor={`field-${field.key}`}
          className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1"
        >
          {field.label}
          {field.required && <span className="text-[color:var(--color-ruby)]"> *</span>}
        </label>
        <select
          id={`field-${field.key}`}
          name={name}
          required={field.required}
          defaultValue=""
          className="w-full h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
        >
          <option value="">Select…</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-[color:var(--color-ink)] cursor-pointer sm:col-span-2">
        <input
          type="checkbox"
          name={name}
          value="1"
          className="h-4 w-4 rounded border-[color:var(--color-border-strong)] text-[color:var(--color-ruby)] focus:ring-[color:var(--color-ruby)]"
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="sm:col-span-2">
        <TextField
          label={field.label}
          name={name}
          as="textarea"
          rows={3}
          required={field.required}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  return (
    <TextField
      label={field.label}
      name={name}
      type={field.type === 'number' ? 'number' : 'text'}
      required={field.required}
      placeholder={field.placeholder}
    />
  );
}
