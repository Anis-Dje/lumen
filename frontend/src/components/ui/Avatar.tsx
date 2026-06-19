import { useState } from 'react';
import clsx from 'clsx';

/**
 * Circular user avatar. Shows the photo (e.g. an OAuth `avatar_url`) when
 * available, otherwise falls back to the user's initials on a tinted disc.
 */
export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className={clsx('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid shrink-0 place-items-center rounded-full bg-accent-primary/20 font-semibold text-accent-primary',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initials}
    </span>
  );
}
