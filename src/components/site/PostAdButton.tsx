import Link from 'next/link';

interface PostAdButtonProps {
  variant?: 'primary' | 'compact';
  label?: string;
  className?: string;
}

/**
 * Single source of truth for the "Post an ad" CTA. Always renders white text,
 * and leaves enough specificity on the color so global anchor styles can't
 * override it.
 */
export function PostAdButton({
  variant = 'primary',
  label = 'Post an ad',
  className = '',
}: PostAdButtonProps) {
  const base =
    'group inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-ruby)] !text-white font-semibold tracking-wide shadow-[var(--shadow-card)] hover:bg-[color:var(--color-ruby-deep)] hover:shadow-[var(--shadow-lift)] transition-[background-color,box-shadow,transform] active:scale-[0.98]';
  const size =
    variant === 'compact'
      ? 'h-9 px-3.5 text-xs'
      : 'h-10 md:h-11 px-4 md:px-5 text-sm';
  return (
    <Link href="/post-ad" className={`${base} ${size} ${className}`}>
      <PlusIcon />
      <span>{label}</span>
    </Link>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
