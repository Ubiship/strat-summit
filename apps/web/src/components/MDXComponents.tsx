import Image, { type ImageProps } from 'next/image'
import clsx from 'clsx'

import { Blockquote } from '@/components/Blockquote'
import { Border } from '@/components/Border'
import { StatList, StatListItem } from '@/components/StatList'
import { TagList, TagListItem } from '@/components/TagList'

export const MDXComponents = {
  Blockquote({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof Blockquote>) {
    return <Blockquote className={clsx('my-32', className)} {...props} />
  },
  img: function Img({
    className,
    alt = '',
    ...props
  }: Omit<ImageProps, 'alt'> & { alt?: string }) {
    return (
      <div
        className={clsx(
          'my-10 overflow-hidden rounded-[2.75rem] bg-sand max-sm:-mx-6',
          className,
        )}
      >
        <Image
          alt={alt}
          {...props}
          sizes="(min-width: 768px) 42rem, 100vw"
          className="aspect-16/10 w-full object-cover photo-warm"
        />
      </div>
    )
  },
  StatList({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof StatList>) {
    return (
      <StatList className={clsx('my-32 max-w-none!', className)} {...props} />
    )
  },
  StatListItem,
  table: function Table({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<'table'>) {
    return (
      <div
        className={clsx(
          'my-10 max-sm:-mx-6 max-sm:flex max-sm:overflow-x-auto',
          className,
        )}
      >
        <div className="max-sm:min-w-full max-sm:flex-none max-sm:px-6">
          <table {...props} />
        </div>
      </div>
    )
  },
  TagList({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof TagList>) {
    return <TagList className={clsx('my-6', className)} {...props} />
  },
  TagListItem,
  TopTip({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) {
    return (
      <Border position="left" className={clsx('my-10 pl-8', className)}>
        <p className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
          Top tip
        </p>
        <div className="mt-4">{children}</div>
      </Border>
    )
  },
  Typography({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return <div className={clsx('typography', className)} {...props} />
  },
  wrapper({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return (
      <div
        className={clsx(
          '*:mx-auto *:max-w-3xl *:first:mt-0! *:last:mb-0!',
          className,
        )}
        {...props}
      />
    )
  },
}
