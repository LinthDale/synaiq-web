import assert from 'node:assert/strict';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export const sha = data => createHash('sha256').update(data).digest('hex');
export const STATE = '.hostinger-ci-state.json';
export const GUIDE = '00-SYNAIQ-START-HERE.txt';
export const releaseName = name => {
  assert.match(name, /^synaiq-release-[a-z0-9]+(?:-[a-z0-9]+)*$/);
  return name;
};
export function safePath(path) {
  assert.match(path, /^[A-Za-z0-9_.\/-]+$/);
  assert.ok(!path.split('/').some(p => ['', '.', '..'].includes(p)), 'Unsafe path');
  return path;
}
export function activeRelease(text) {
  const matches = [...text.matchAll(/^RewriteRule \^\$ \/(synaiq-release-[a-z0-9-]+)\/index\.html \[L\]\r?$/gm)];
  assert.equal(matches.length, 1, 'Expected one known production root rule');
  return releaseName(matches[0][1]);
}
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function buildRouting(base, name, paths) {
  releaseName(name);
  const current = activeRelease(base);
  assert.notEqual(current, name);
  assert.ok(!base.includes(name), 'Release already referenced');
  for (const required of ['index.html', 'page.html', 'robots.txt', 'sitemap.xml']) assert.ok(paths.includes(required));
  paths.forEach(safePath);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(!paths.some(p => /(?:^|\/)(?:\.htaccess|preview\.js|\.env)/.test(p)));
  const anchor = '# Only inspected static releases remain public.';
  assert.equal(base.split(anchor).length, 2);
  assert.equal(base.split('RewriteRule ^ - [G,L]').length, 2, 'Missing deny-by-default routing');
  assert.ok(base.includes('Header always set Cache-Control "no-cache, must-revalidate"'));
  const eol = base.includes('\r\n') ? '\r\n' : '\n';
  const rule = `RewriteRule ^${escape(name)}/(?:${paths.map(escape).join('|')})$ - [L]`;
  assert.ok(Buffer.byteLength(rule) < 8000);
  // Only current and candidate are public. Other host directives remain byte-for-byte intact.
  const lines = base.split(eol).filter(line => {
    const match = line.match(/^RewriteRule \^(synaiq-release-[a-z0-9-]+)\//);
    return !match || match[1] === current;
  });
  assert.equal(lines.filter(line => line.startsWith(`RewriteRule ^${current}/`)).length, 1);
  const preview = lines.join(eol).replace(anchor, () => `${anchor}${eol}${rule}`);
  let live = preview;
  for (const [from, to] of [
    [`RewriteRule ^$ /${current}/index.html [L]`, `RewriteRule ^$ /${name}/index.html [L]`],
    ...['robots.txt', 'sitemap.xml'].map(file => [
      `RewriteRule ^${escape(file)}$ /${current}/${file} [L]`,
      `RewriteRule ^${escape(file)}$ /${name}/${file} [L]`,
    ]),
    [`# Active folder: ${current};`, `# Active folder: ${name};`],
  ]) {
    assert.equal(live.split(from).length, 2, `Missing or duplicate routing anchor: ${from}`);
    live = live.replace(from, () => to);
  }
  assert.equal(activeRelease(preview), current);
  assert.equal(activeRelease(live), name);
  return { preview, live, current };
}
export function transformSource(bytes, path, name) {
  releaseName(name);
  if (!/\.(html|js|css|svg)$/.test(path)) return bytes;
  let text = bytes.toString('utf8').replaceAll('\r\n', '\n')
    .replaceAll('/brand/', `/${name}/brand/`)
    .replace(/(["'(])assets\//g, `$1/${name}/assets/`);
  if (path === 'page.html') text = text
    .replace(/href="site\.css(?=["?])/g, `href="/${name}/site.css`)
    .replace(/src="prototype\.js(?=["?])/g, `src="/${name}/prototype.js`);
  assert.doesNotMatch(text, /localhost|127\.0\.0\.1|trycloudflare\.com/, `${path}: local address in public payload`);
  if (path === 'page.html') assert.doesNotMatch(text, /Local preview|preview\.js/, 'Production entry contains preview runtime');
  return Buffer.from(text);
}
export function retentionPlan(state, routing, keepCount = 3) {
  assert.ok(Number.isSafeInteger(keepCount) && keepCount >= 3);
  assert.equal(state.schema, 1);
  assert.equal(state.active, activeRelease(routing));
  assert.equal(state.releases[0].name, state.active, 'Release order must record activation, not directory dates');
  const names = state.releases.map(r => releaseName(r.name));
  assert.equal(new Set(names).size, names.length);
  const keep = names.slice(0, keepCount), remove = names.slice(keepCount);
  for (const name of remove) assert.ok(!routing.includes(`${name}/`), `${name} is still routed`);
  return { keep, remove };
}
export function assertNoDependencies(files, remove) {
  for (const [path, bytes] of files) {
    if (!/\.(html|js|mjs|css|json|xml|txt|svg)$/.test(path)) continue;
    for (const name of remove) assert.ok(!bytes.toString('utf8').includes(name), `${path} depends on ${name}`);
  }
}
export function encrypt(bytes, keyHex) {
  assert.match(keyHex ?? '', /^[a-f0-9]{64}$/i, 'HOSTINGER_BACKUP_KEY must be 32 random bytes in hex');
  const nonce = randomBytes(12), cipher = createCipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), nonce);
  const encrypted = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return Buffer.concat([Buffer.from('HCI1'), nonce, cipher.getAuthTag(), encrypted]);
}
export function decrypt(bytes, keyHex) {
  assert.match(keyHex ?? '', /^[a-f0-9]{64}$/i);
  assert.equal(bytes.subarray(0, 4).toString(), 'HCI1');
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), bytes.subarray(4, 16));
  decipher.setAuthTag(bytes.subarray(16, 32));
  return Buffer.concat([decipher.update(bytes.subarray(32)), decipher.final()]);
}
