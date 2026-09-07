/** Shared prop shape for every block component. */
import type { Locale } from '../../config/site.ts';
import type { PageBlock } from '../../content.config.ts';

export type BlockProps<T extends PageBlock['type']> = {
  block: Extract<PageBlock, { type: T }>;
  locale: Locale;
};
