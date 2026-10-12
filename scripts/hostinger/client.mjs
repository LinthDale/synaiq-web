import assert from 'node:assert/strict';
import { sha, safePath, releaseName, STATE, GUIDE } from './core.mjs';

export async function request(url, options = {}) {
  // No automatic mutation retries. Never include authenticated URLs or response bodies in errors.
  return fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(60000) });
}
export async function connect(config, token, fetcher = request) {
  assert.ok(token && !/[\r\n]/.test(token), 'HOSTINGER_API_TOKEN is missing');
  const login = await fetcher('https://developers.hostinger.com/api/hosting/v1/files/upload-urls', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: config.username, domain: config.domain }),
  });
  assert.equal(login.status, 200, `Hostinger session HTTP ${login.status}`);
  const session = await login.json(), base = new URL(session.url);
  assert.equal(base.origin, config.fileOrigin);
  assert.match(base.pathname, /^\/rest\/[a-f0-9]+\/api\/tus\/public_html$/, 'Unexpected session URL structure');
  assert.equal(base.search + base.hash + base.username + base.password, '');
  const auth = { 'X-Auth': session.auth_key, 'X-Auth-Rest': session.rest_auth_key };
  function url(path = '', kind = 'resources') {
    if (path) safePath(path);
    return new URL(session.url.replace('/api/tus/', `/api/${kind}/`) + (path ? `/${path}` : ''));
  }
  async function meta(path = '', missing = false) {
    const response = await fetcher(url(path), { headers: auth });
    if (missing && response.status === 404) return null;
    assert.equal(response.status, 200, `${path || 'root'}: metadata HTTP ${response.status}`);
    const item = await response.json();
    assert.equal(item.path, `/public_html${path ? '/' + path : ''}`);
    assert.equal(item.isSymlink, false, 'Refuse symlink');
    return item;
  }
  async function read(path, expectedSize) {
    const item = expectedSize === undefined ? await meta(path) : { size: expectedSize, isDir: false };
    assert.equal(item.isDir, false);
    const response = await fetcher(url(path, 'raw'), { headers: auth });
    assert.equal(response.status, 200, `${path}: read HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, item.size, `${path}: size changed during read`);
    return bytes;
  }
  async function tree(path) {
    const item = await meta(path);
    assert.equal(item.isDir, true);
    assert.ok(Array.isArray(item.items));
    const files = [], dirs = [path];
    for (const child of item.items) {
      safePath(child.name); assert.ok(!child.name.includes('/'));
      assert.equal(child.isSymlink, false);
      const name = `${path}/${child.name}`;
      assert.equal(child.path, `/public_html/${name}`);
      if (child.isDir) {
        const nested = await tree(name); files.push(...nested.files); dirs.push(...nested.dirs);
      } else files.push({ path: name, size: child.size });
    }
    return { dirs: dirs.sort(), files: files.sort((a, b) => a.path.localeCompare(b.path)) };
  }
  async function upload(path, bytes) {
    safePath(path);
    assert.ok(/^synaiq-release-[a-z0-9-]+\//.test(path) || /^\.ci-candidate-[a-z0-9-]+$/.test(path), 'Upload outside candidate scope');
    assert.equal(await meta(path, true), null, `${path}: already exists`);
    const headers = { ...auth, 'Tus-Resumable': '1.0.0', 'Upload-Offset': '0' };
    const created = await fetcher(url(path, 'tus'), { method: 'POST', headers: { ...headers, 'Upload-Length': String(bytes.length) } });
    assert.equal(created.status, 201, `${path}: create HTTP ${created.status}`);
    for (let offset = 0; offset < bytes.length;) {
      const end = Math.min(offset + 2 * 1024 * 1024, bytes.length);
      const response = await fetcher(url(path, 'tus'), {
        method: 'PATCH', headers: { ...headers, 'Upload-Offset': String(offset), 'Content-Type': 'application/offset+octet-stream' },
        body: bytes.subarray(offset, end),
      });
      assert.equal(response.status, 204, `${path}: upload HTTP ${response.status}`);
      assert.equal(response.headers.get('upload-offset'), String(end)); offset = end;
    }
    assert.equal(sha(await read(path)), sha(bytes), `${path}: uploaded hash differs`);
  }
  async function guard(path, expected) {
    const item = await meta(path, true);
    if (expected === null) assert.equal(item, null, `${path}: unexpectedly exists`);
    else { assert.ok(item); assert.equal(sha(await read(path)), expected, `${path}: changed externally`); }
  }
  async function replace(path, bytes, expected, id) {
    assert.ok(['.htaccess', STATE, GUIDE].includes(path), 'Replacement outside control files');
    assert.match(id, /^[a-z0-9-]+$/);
    const candidate = `.ci-candidate-${id}`;
    await guard(path, expected); await upload(candidate, bytes); await guard(path, expected);
    const target = url(candidate);
    target.searchParams.set('action', 'rename'); target.searchParams.set('destination', `/public_html/${path}`);
    target.searchParams.set('override', 'true');
    const response = await fetcher(target, { method: 'PATCH', headers: auth });
    assert.ok(response.ok, `${path}: rename HTTP ${response.status}`);
    await guard(path, sha(bytes));
  }
  async function removeRelease(name) {
    releaseName(name);
    const response = await fetcher(url(name), { method: 'DELETE', headers: auth });
    assert.ok(response.ok, `${name}: delete HTTP ${response.status}`);
    assert.equal(await meta(name, true), null, `${name}: still exists after delete`);
  }
  async function purge() {
    for (const domain of config.cacheDomains) {
      const response = await fetcher(`https://developers.hostinger.com/api/hosting/v1/accounts/${config.username}/websites/${domain}/cache/clear`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(response.status, 200, `${domain}: cache purge HTTP ${response.status}`);
    }
  }
  return { meta, read, tree, upload, guard, replace, removeRelease, purge };
}
