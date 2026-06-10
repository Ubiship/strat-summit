'use client';

import { NovuProvider as NovuReactProvider } from '@novu/react';
import type { ReactNode } from 'react';

const NOVU_APP_ID = process.env.NEXT_PUBLIC_NOVU_APP_ID || '';

type Props = {
  subscriberId: string;
  children: ReactNode;
};

export function NovuProvider({ subscriberId, children }: Props) {
  if (!NOVU_APP_ID) {
    // If Novu is not configured, just render children
    return <>{children}</>;
  }

  return (
    <NovuReactProvider
      applicationIdentifier={NOVU_APP_ID}
      subscriberId={subscriberId}
    >
      {children}
    </NovuReactProvider>
  );
}
