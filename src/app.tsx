import { layout } from '@/app/layout';
import { getInitialState } from '@/app/initial-state';
import { errorConfig } from '@/requestErrorConfig';

export { getInitialState, layout };

export const request = {
  ...errorConfig,
};
