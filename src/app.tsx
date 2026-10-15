import { layout } from '@/app/layout';
import { getInitialState } from '@/app/initial-state';
import { errorConfig } from '@/requestErrorConfig';
import AssetLoadingHost from '@/app/AssetLoadingHost';
import type { ReactNode } from 'react';

export { getInitialState, layout };

export function rootContainer(container: ReactNode) {
  return <AssetLoadingHost>{container}</AssetLoadingHost>;
}

export const request = {
  ...errorConfig,
};
