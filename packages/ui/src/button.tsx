'use client';

import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonProps = {
  invert?: boolean;
  children: ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>)
  | ({ href?: undefined } & ComponentPropsWithoutRef<'button'>)
);

export function Button({
  invert = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = clsx(
    className,
    'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
    invert
      ? 'bg-white text-neutral-950 hover:bg-stone'
      : 'bg-gold text-white hover:bg-gold-dark',
    'disabled:cursor-not-allowed disabled:opacity-50'
  );

  const inner = <span className="relative top-px">{children}</span>;

  if (typeof props.href === 'string') {
    const { href, ...rest } = props as { href: string } & ComponentPropsWithoutRef<'a'>;
    return (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }

  const buttonProps = props as ComponentPropsWithoutRef<'button'>;
  return (
    <button className={classes} {...buttonProps}>
      {inner}
    </button>
  );
}
