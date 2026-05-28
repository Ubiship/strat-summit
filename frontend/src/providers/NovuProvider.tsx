'use client';

import { NovuProvider as NovuProviderBase } from '@novu/react';
import { ReactNode } from 'react';

interface NovuProviderProps {
  children: ReactNode;
  subscriberId: string;
}

export function NovuProvider({ children, subscriberId }: NovuProviderProps) {
  const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_ID;
  const backendUrl = process.env.NEXT_PUBLIC_NOVU_API_URL;

  if (!applicationIdentifier) {
    // Novu not configured, render children without provider
    return <>{children}</>;
  }

  return (
    <NovuProviderBase
      subscriber={subscriberId}
      applicationIdentifier={applicationIdentifier}
      backendUrl={backendUrl}
    >
      {children}
    </NovuProviderBase>
  );
}
