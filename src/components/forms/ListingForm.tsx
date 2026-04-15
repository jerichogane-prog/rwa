'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { TextField } from './TextField';
import { ImageUploader, type PendingImage } from './ImageUploader';
import { CategoryFields } from './CategoryFields';
import { flattenTaxonomy } from '@/lib/taxonomy';
import type { TaxonomyNode } from '@/lib/wp';

const REST_BASE = '/api/wp/rwa/v1';

export interface ListingFormValues {
  title: string;
  description: string;
  price: number;
  phone: string;
  ad_type: string;
  category: string;
  location: string;
  state: string;
  city: string;
  address: string;
  zipcode: string;
  fields: Record<string, string>;
}

export interface ListingFormInitial {
  title?: string;
  description?: string;
  price?: number;
  phone?: string;
  ad_type?: string;
  category?: string;
  location?: string;
}

export interface ListingFormProps {
  mode: 'create' | 'edit';
  initialValues?: ListingFormInitial;
  /** New images staged for upload (file objects). Parent owns state so edit
   *  pages can separately display existing images. */
  images: PendingImage[];
  onImagesChange(next: PendingImage[]): void;
  /** Slot rendered above `<ImageUploader>` — used in edit mode to show
   *  already-uploaded images with per-image delete buttons. */
  galleryPanel?: ReactNode;
  onSubmit(values: ListingFormValues): Promise<void> | void;
  submitLabel: string;
  submittingLabel?: string;
  stage: 'idle' | 'submitting' | 'uploading';
  error?: string | null;
}

const DEFAULT_VALUES: ListingFormInitial = {
  title: '',
  description: '',
  price: 0,
  phone: '',
  ad_type: 'sell',
  category: '',
  location: '',
};

export function ListingForm({
  mode,
  initialValues,
  images,
  onImagesChange,
  galleryPanel,
  onSubmit,
  submitLabel,
  submittingLabel,
  stage,
  error,
}: ListingFormProps) {
  const init = { ...DEFAULT_VALUES, ...initialValues };
  const [categories, setCategories] = useState<TaxonomyNode[]>([]);
  const [locations, setLocations] = useState<TaxonomyNode[]>([]);
  const [stateSlug, setStateSlug] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>(init.category ?? '');

  useEffect(() => {
    Promise.all([
      fetch(`${REST_BASE}/categories`).then((r) => r.json() as Promise<TaxonomyNode[]>),
      fetch(`${REST_BASE}/locations`).then((r) => r.json() as Promise<TaxonomyNode[]>),
    ])
      .then(([c, l]) => {
        setCategories(c);
        setLocations(l);
        // When editing, try to resolve the stored location slug to a
        // state/city so the selects pre-populate correctly.
        if (init.location && l.length > 0) {
          for (const state of l) {
            if (state.slug === init.location) {
              setStateSlug(state.slug);
              return;
            }
            const child = state.children?.find((n) => n.slug === init.location);
            if (child) {
              setStateSlug(state.slug);
              return;
            }
          }
        }
      })
      .catch(() => {
        // non-fatal
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateOptions = useMemo(
    () => locations.map((n) => ({ value: n.slug, label: n.name })),
    [locations],
  );
  const cityOptions = useMemo(() => {
    const parent = locations.find((n) => n.slug === stateSlug);
    return parent?.children?.map((n) => ({ value: n.slug, label: n.name })) ?? [];
  }, [locations, stateSlug]);
  const initialCitySlug = useMemo(() => {
    if (!init.location) return '';
    for (const s of locations) {
      const c = s.children?.find((n) => n.slug === init.location);
      if (c) return c.slug;
    }
    return '';
  }, [locations, init.location]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const stateValue = String(data.get('state') ?? '').trim();
    const citySlug = String(data.get('city_slug') ?? '').trim();
    const cityText = String(data.get('city') ?? '').trim();
    const dynamicFields: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      const match = key.match(/^fields\[(.+)\]$/);
      if (match && typeof value === 'string' && value !== '') {
        dynamicFields[match[1]] = value;
      }
    }
    const payload: ListingFormValues = {
      title: String(data.get('title') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      price: Number(data.get('price') ?? 0),
      category: String(data.get('category') ?? ''),
      location: citySlug || stateValue,
      state: stateValue,
      city: citySlug || cityText,
      address: String(data.get('address') ?? '').trim(),
      zipcode: String(data.get('zipcode') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      ad_type: String(data.get('ad_type') ?? 'sell'),
      fields: dynamicFields,
    };
    await onSubmit(payload);
  }

  const categoryOptions = flattenTaxonomy(categories);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5 sm:p-6"
    >
      <AdTypePicker defaultValue={init.ad_type ?? 'sell'} />

      <TextField
        label="Title"
        name="title"
        required
        placeholder="2018 Toyota Hilux, low kms"
        defaultValue={init.title}
      />
      <TextField
        label="Description"
        name="description"
        as="textarea"
        rows={6}
        required
        placeholder="Describe condition, features, reason for selling…"
        defaultValue={init.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Price (USD)"
          name="price"
          type="number"
          hint="Leave 0 for POA"
          defaultValue={init.price ? String(init.price) : ''}
        />
        <TextField
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={init.phone}
        />
      </div>

      <SelectField
        label="Category"
        name="category"
        options={categoryOptions}
        value={categorySlug}
        onChange={setCategorySlug}
      />

      <CategoryFields categorySlug={categorySlug} />

      <fieldset className="space-y-4">
        <legend className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
          Location
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlainSelect
            label="State"
            name="state"
            options={stateOptions}
            value={stateSlug}
            onChange={setStateSlug}
          />
          {cityOptions.length > 0 ? (
            <PlainSelect
              label="City"
              name="city_slug"
              options={cityOptions}
              defaultValue={initialCitySlug}
            />
          ) : (
            <TextField label="City" name="city" autoComplete="address-level2" />
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          <TextField label="Address" name="address" autoComplete="street-address" placeholder="Street address" />
          <TextField label="Zip code" name="zipcode" autoComplete="postal-code" />
        </div>
      </fieldset>

      {galleryPanel}
      <ImageUploader value={images} onChange={onImagesChange} />

      {error && (
        <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={stage !== 'idle'}
        className="w-full h-12 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
      >
        {stage === 'submitting'
          ? submittingLabel || 'Submitting…'
          : stage === 'uploading'
            ? `Uploading ${images.length} photo${images.length === 1 ? '' : 's'}…`
            : submitLabel}
      </button>
      <p className="text-[11px] text-[color:var(--color-ink-subtle)] text-center">
        {mode === 'edit'
          ? 'Saving an edit may send your ad back to pending review.'
          : 'An admin will review before your ad goes live.'}
      </p>
    </form>
  );
}

const AD_TYPE_OPTIONS: { value: string; label: string; hint: string; icon: string }[] = [
  { value: 'sell', label: 'For sale', hint: 'Selling an item', icon: '$' },
  { value: 'buy', label: 'Wanted', hint: 'Looking to buy', icon: '?' },
  { value: 'rentlease', label: 'Rent / lease', hint: 'Renting or leasing', icon: '◧' },
  { value: 'lostfound', label: 'Lost & found', hint: 'Lost or found', icon: '!' },
  { value: 'job', label: 'Job', hint: 'Hiring', icon: '☷' },
  { value: 'event', label: 'Event', hint: 'Event or gathering', icon: '★' },
];

function AdTypePicker({ defaultValue }: { defaultValue: string }) {
  return (
    <fieldset>
      <legend className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-2">
        Ad type <span className="text-[color:var(--color-ruby)]">*</span>
      </legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AD_TYPE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="relative flex items-start gap-2 p-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] cursor-pointer transition-colors hover:border-[color:var(--color-ruby)]/40 has-[:checked]:border-[color:var(--color-ruby)] has-[:checked]:bg-[color:var(--color-ruby-soft)]"
          >
            <input
              type="radio"
              name="ad_type"
              value={opt.value}
              defaultChecked={opt.value === defaultValue}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="inline-flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-subtle)] text-xs font-bold peer-checked:bg-[color:var(--color-ruby)] peer-checked:text-white"
            >
              {opt.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[color:var(--color-ink)]">{opt.label}</span>
              <span className="block text-[11px] text-[color:var(--color-ink-muted)] leading-snug">{opt.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface SelectOption {
  value: string;
  label: string;
  depth?: number;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

function SelectField({ label, name, options, value, onChange }: SelectFieldProps) {
  const controlled = value !== undefined;
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1"
      >
        {label}
      </label>
      <select
        id={`field-${name}`}
        name={name}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.depth ? `${'— '.repeat(opt.depth)}${opt.label}` : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface PlainSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function PlainSelect({ label, name, options, value, defaultValue, onChange }: PlainSelectProps) {
  const controlled = value !== undefined;
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1"
      >
        {label}
      </label>
      <select
        id={`field-${name}`}
        name={name}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : defaultValue ?? ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
