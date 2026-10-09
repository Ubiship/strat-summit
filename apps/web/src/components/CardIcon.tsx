import Image, { type StaticImageData } from 'next/image'
import clsx from 'clsx'

const sizes = {
  sm: { className: 'size-11', sizes: '3rem' },
  md: { className: 'size-20', sizes: '6rem' },
}

// Generated clay icons are trimmed transparent PNGs, so object-contain keeps
// wide and tall artwork at a consistent visual weight.
export function CardIcon({
  src,
  size = 'md',
  className,
}: {
  src: StaticImageData
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <Image
      src={src}
      alt=""
      sizes={sizes[size].sizes}
      className={clsx(
        'flex-none object-contain object-left',
        sizes[size].className,
        className,
      )}
    />
  )
}
