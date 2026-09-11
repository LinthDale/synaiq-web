import { createServer } from 'node:http';
import { lstat, open, realpath } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// This is a public design-only allowlist, not a general repository file server.
// New assets must be reviewed and explicitly named before they can be shared.
const runtimeFiles = [
  'index.html', 'page.html', 'prototype.js',
  'site.css', 'tokens.css',
  'home-design.js',
  'demo-animation.js',
  'kip-design.js',
  'i18n.js', 'brand.js', 'shared-design.js', 'preview.js',
  'locale-common.js', 'locale-home.js', 'locale-kip.js', 'locale-demo.js',
  'assets/knowledge-threads-v2.png', 'assets/shared-knowledge-hands-v1.png',
  'assets/kip-search-demo.svg', 'assets/kip-library-demo.svg',
  'assets/kip-search-demo-en.svg', 'assets/kip-library-demo-en.svg',
  'assets/torn-letter-edge.svg', 'assets/torn-paper-cotton-v2.webp',
  'assets/ceo-speaking-sketch-v1.webp',
  'assets/synaiq-logo-ink.svg',
  'assets/kip-connected-work-v1.webp',
  'assets/contact-cat-yarn-v1.webp',
  'assets/investing-cio-20240629.png', 'assets/news-sketch-frame-v2.webp',
  'assets/kip-wordmark.png', 'assets/demo-paper-edge.webp',
  'assets/demo-sidebar-dialogues.webp', 'assets/demo-send-pen.webp',
];
const productFiles = ['synaiq-logo-light.svg', 'wally/wally-2.png', 'wally/wally-series.png', 'wally-2-plus.png', 'wally-mini.png'];

export const PUBLIC_FILES = Object.freeze([
  ...runtimeFiles.map(file => Object.freeze({ url: `/live-prototype/${file}`, root: 'prototype', file })),
  ...productFiles.map(file => Object.freeze({ url: `/brand/${file}`, root: 'brand', file })),
]);

const defaultRoots = Object.freeze({
  prototype: fileURLToPath(new URL('.', import.meta.url)),
  brand: fileURLToPath(new URL('../../../public/brand/', import.meta.url)),
});
const routes = new Map(PUBLIC_FILES.flatMap(entry => entry.root === 'prototype'
  ? [[entry.url, entry], [`/${entry.file}`, entry]]
  : [[entry.url, entry]]));
routes.set('/', routes.get('/live-prototype/index.html'));
routes.set('/live-prototype/', routes.get('/live-prototype/index.html'));

const contentTypes = Object.freeze({
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
});
const securityHeaders = Object.freeze({
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy': [
    "default-src 'none'", "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com', "img-src 'self' data: https://synaiq.com",
    "connect-src 'none'", "frame-src 'self'", "frame-ancestors 'self'",
    "base-uri 'none'", "form-action 'none'", "object-src 'none'",
  ].join('; '),
});

function publicPath(rawUrl) {
  // Do not let URL normalization erase traversal evidence before validation.
  if (typeof rawUrl !== 'string' || rawUrl.length > 2048 || !rawUrl.startsWith('/')
      || /[\\#\u0000-\u0020\u007f]/.test(rawUrl)) return null;
  try { decodeURIComponent(rawUrl); } catch { return null; }
  const pathname = rawUrl.split('?')[0];
  if (pathname.includes('%') || pathname.includes('//')) return null;
  if (pathname.split('/').some(segment => segment === '.' || segment === '..')) return null;
  return pathname;
}

function insideRoot(root, candidate) {
  const difference = relative(root, candidate);
  return difference !== '' && difference !== '..'
    && !difference.startsWith(`..${sep}`) && !isAbsolute(difference);
}

async function readPublicFile(root, entry) {
  const canonicalRoot = await realpath(root);
  const candidate = join(canonicalRoot, entry.file);
  const canonicalFile = await realpath(candidate);
  if (!insideRoot(canonicalRoot, canonicalFile)) return null;

  // Reject symlinks/junctions even when their present target is inside the root.
  // The HTTP request never supplies a filesystem path or a root directory.
  for (let current = candidate; current !== canonicalRoot; current = dirname(current)) {
    if ((await lstat(current)).isSymbolicLink()) return null;
  }
  const handle = await open(canonicalFile, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    if (!(await handle.stat()).isFile()) return null;
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

function send(response, method, status, body, type = 'text/plain; charset=utf-8', extra = {}) {
  response.writeHead(status, {
    ...securityHeaders, ...extra, 'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(method === 'HEAD' ? undefined : body);
}

/** Build a read-only handler. Root overrides exist for isolated tests, not URL parameters. */
export function createPreviewHandler({ prototypeRoot = defaultRoots.prototype, brandRoot = defaultRoots.brand } = {}) {
  const roots = Object.freeze({ prototype: resolve(prototypeRoot), brand: resolve(brandRoot) });
  return async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, request.method, 405, 'Method not allowed\n', undefined, { Allow: 'GET, HEAD' });
      return;
    }
    const pathname = publicPath(request.url);
    if (pathname === null) {
      send(response, request.method, 400, 'Invalid request\n');
      return;
    }
    if (pathname === '/robots.txt') {
      send(response, request.method, 200, 'User-agent: *\nDisallow: /\n');
      return;
    }
    const entry = routes.get(pathname);
    if (entry) {
      try {
        const body = await readPublicFile(roots[entry.root], entry);
        if (body !== null) {
          send(response, request.method, 200, body, contentTypes[extname(entry.file)]);
          return;
        }
      } catch {
        // Missing, inaccessible or replaced files all have the same public response.
        // Never disclose local paths, source details or stack traces through HTTP.
      }
    }
    send(response, request.method, 404, 'Not found\n');
  };
}

export function createPreviewServer(options = {}) {
  return createServer({ requestTimeout: 15_000, headersTimeout: 10_000, maxHeaderSize: 8192 }, createPreviewHandler(options));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4318);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('Choose an integer port between 1 and 65535.');
    process.exitCode = 1;
  } else {
    const server = createPreviewServer();
    server.on('error', () => {
      console.error('The design preview could not start. Check that its port is available.');
      process.exitCode = 1;
    });
    server.listen(port, '127.0.0.1', () => {
      console.log(`Read-only design preview: http://127.0.0.1:${port}/live-prototype/`);
    });
  }
}
