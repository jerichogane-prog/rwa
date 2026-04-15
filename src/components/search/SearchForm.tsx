'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  depth?: number;
}

interface SearchFormProps {
  categories: SelectOption[];
  locations: SelectOption[];
  variant?: 'hero' | 'inline';
}

export function SearchForm({ categories, locations, variant = 'hero' }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  }

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={onSubmit}
      className={
        isHero
          ? 'rounded-[var(--radius-lg)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] shadow-[var(--shadow-card)] p-3 grid gap-2 md:grid-cols-[1.25fr_1fr_1fr_auto]'
          : 'grid gap-2'
      }
      role="search"
      aria-label="Search listings"
    >
      <div className="relative">
        <label htmlFor="search-q" className="sr-only">
          What are you looking for?
        </label>
        <SearchIcon />
        <input
          id="search-q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full h-12 pl-10 pr-3 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] text-sm placeholder:text-[color:var(--color-ink-subtle)] focus:bg-[color:var(--color-surface-raised)] focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
        />
      </div>

      {isHero && (
        <>
          <Select
            id="search-category"
            label="Category"
            value={category}
            onChange={setCategory}
            placeholder="All categories"
            options={categories}
          />

          <Select
            id="search-location"
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="All locations"
            options={locations}
          />
        </>
      )}

      <button
        type="submit"
        className="h-12 px-6 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold tracking-wide hover:bg-[color:var(--color-ruby-deep)] transition-colors"
      >
        Search
      </button>
    </form>
  );
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
}

function Select({ id, label, value, onChange, placeholder, options }: SelectProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 pl-4 pr-10 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] text-sm text-[color:var(--color-ink)] appearance-none focus:bg-[color:var(--color-surface-raised)] focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.depth ? `${'— '.repeat(opt.depth)}${opt.label}` : opt.label}
          </option>
        ))}
      </select>
      <ChevronDown />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-ink-subtle)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-ink-subtle)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
