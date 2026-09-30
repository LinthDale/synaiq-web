import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderPvsim, renderEms } from './energy-design.js';
import { PUBLIC_FILES } from './share-preview.mjs';

test('PVsim offers an explicitly activated 3D view in both languages without changing EMS', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const html = renderPvsim({ locale });
    assert.match(html, /data-pvsim-start/);
    assert.match(html, /data-pvsim-viewer hidden/);
    for (const action of ['in', 'out', 'top', 'home', 'site', 'exit']) assert.ok(html.includes(`data-pvsim-action="${action}"`));
    assert.doesNotMatch(renderEms({ locale }), /data-pvsim-viewer/);
  }
});

test('public 3D assets contain only local geometry, without names, metadata or external resources', async () => {
  for (const name of ['site', 'panels']) {
    const file = `assets/pvsim-${name}-demo.glb`;
    assert.ok(PUBLIC_FILES.some(entry => entry.file === file));
    const data = await readFile(new URL(file, import.meta.url));
    assert.equal(data.readUInt32LE(0), 0x46546c67);
    assert.equal(data.readUInt32LE(4), 2);
    assert.equal(data.readUInt32LE(8), data.length);
    const json = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString());
    const inspect = value => {
      if (!value || typeof value !== 'object') return;
      for (const key of ['name', 'extras', 'extensions', 'uri', 'generator']) assert.equal(Object.hasOwn(value, key), false, key);
      for (const child of Object.values(value)) inspect(child);
    };
    inspect(json);
    const positions = json.accessors[json.meshes[0].primitives[0].attributes.POSITION];
    assert.ok(positions.count > 0);
    assert.ok([...positions.min, ...positions.max].every(Number.isFinite));
    if (name === 'panels') for (let axis = 0; axis < 3; axis++) assert.ok(Math.abs(positions.min[axis] + positions.max[axis]) < 0.002, 'Panel origin is centered, not a geographic coordinate');
  }
});
