import { Fragment } from 'react'

// The client dislikes Fraunces' looping "&", so display headings set it in
// the sans font instead.
export function SansAmpersand({ children }: { children: string }) {
  return children.split('&').map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <span className="font-sans font-semibold">&amp;</span>}
      {part}
    </Fragment>
  ))
}
