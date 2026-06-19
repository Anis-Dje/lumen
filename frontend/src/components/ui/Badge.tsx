import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  return (
    <span
      className={clsx('badge', {
        'badge-success': variant === 'success',
        'badge-warning': variant === 'warning',
        'badge-danger': variant === 'danger',
        'badge-info': variant === 'info',
        'badge-neutral': variant === 'neutral',
      }, className)}
    >
      {children}
    </span>
  );
};
