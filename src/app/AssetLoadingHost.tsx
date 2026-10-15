import { useEffect, type ReactNode } from 'react';

declare global {
  interface Window {
    __ERIDANUS_ASSETS__?: {
      begin: (id: string) => void;
      retry: (id: string) => void;
      end: (id: string) => void;
      fail: (id: string) => void;
      ready: () => void;
    };
  }
}

export default function AssetLoadingHost({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.__ERIDANUS_ASSETS__?.ready();
  }, []);

  return children;
}
