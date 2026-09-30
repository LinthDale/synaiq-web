// Build the self-hosted, pinned Three.js subset used by the public PVsim viewer.
import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const destination = new URL('../docs/design/live-prototype/vendor/', import.meta.url);
await mkdir(destination, { recursive: true });
await build({
  stdin: {
    contents: `export { WebGLRenderer, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, MeshStandardMaterial, Box3, Vector3, Color, DoubleSide } from 'three';
export { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';`,
    resolveDir: fileURLToPath(new URL('../', import.meta.url)),
  },
  bundle: true, format: 'esm', minify: true, target: 'es2022', legalComments: 'inline',
  outfile: fileURLToPath(new URL('pvsim-three.js', destination)),
});
await copyFile(new URL('../node_modules/three/LICENSE', import.meta.url), new URL('three-LICENSE.txt', destination));
