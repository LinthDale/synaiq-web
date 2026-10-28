// Node tests explicitly preload all catalogs; browsers load only their selected locale.
import { SUPPORTED_LOCALES, loadMessages } from './locale-store.js';
await Promise.all(SUPPORTED_LOCALES.map(({ code }) => loadMessages(code)));
