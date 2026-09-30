import { escapeHtml as e } from './i18n.js';

export function renderPvsimViewer(m) {
  return `<button class="pvsim-start button" type="button" data-pvsim-start>${e(m.start)}</button>
    <div class="pvsim-viewer" data-pvsim-viewer hidden>
      <div class="pvsim-toolbar" role="group" aria-label="${e(m.controls)}">${['in', 'out', 'top', 'home', 'site', 'exit'].map(action => `<button type="button" data-pvsim-action="${action}">${e(m[action])}</button>`).join('')}</div>
      <div class="pvsim-canvas" data-pvsim-canvas></div>
      <p class="pvsim-help" id="pvsim-help">${e(m.help)}</p>
    </div>
    <p class="pvsim-status" data-pvsim-status role="status" hidden></p>`;
}

async function createViewer(host, m, onFailure) {
  const T = await import('./vendor/pvsim-three.js');
  const mount = host.querySelector('[data-pvsim-canvas]');
  let renderer, controls, resizeObserver, scene, disposed = false;
  const disposeObject = object => object?.traverse(item => {
    item.geometry?.dispose();
    for (const material of [item.material].flat()) material?.dispose();
  });
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    resizeObserver?.disconnect();
    controls?.dispose();
    disposeObject(scene);
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer?.domElement.remove();
  };
  try {
    renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor('#102532');
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'group');
    canvas.setAttribute('aria-label', m.canvas);
    canvas.setAttribute('aria-describedby', 'pvsim-help');
    mount.append(canvas);
    scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, 1, 0.1, 5000);
    camera.up.set(0, 0, 1);
    controls = new T.OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.minDistance = 3;
    controls.maxDistance = 1600;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.listenToKeyEvents(canvas);
    scene.add(new T.HemisphereLight(0xd7f1ff, 0x203546, 2.6));
    const sun = new T.DirectionalLight(0xffffff, 3);
    sun.position.set(-50, -80, 150);
    scene.add(sun);
    const loader = new T.GLTFLoader();
    // Self-hosted, de-identified copies. No DGX login or third-party request in this view.
    const results = await Promise.allSettled([
      loader.loadAsync(new URL('./assets/pvsim-site-demo.glb', import.meta.url).href),
      loader.loadAsync(new URL('./assets/pvsim-panels-demo.glb', import.meta.url).href),
    ]);
    for (const result of results) if (result.status === 'fulfilled') scene.add(result.value.scene);
    if (results.some(result => result.status === 'rejected')) throw new Error('Model unavailable');
    const [site, panels] = results.map(result => result.value.scene);
    for (const [object, color] of [[site, '#a9c0c7'], [panels, '#16c4c8']]) object.traverse(item => {
      if (!item.isMesh) return;
      item.geometry.computeVertexNormals();
      for (const material of [item.material].flat()) material?.dispose();
      item.material = new T.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, side: T.DoubleSide, polygonOffset: object === panels, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    });
    const panelBounds = new T.Box3().setFromObject(panels), siteBounds = new T.Box3().setFromObject(site);
    const render = () => { if (!disposed && !host.hidden) renderer.render(scene, camera); };
    const resize = () => {
      if (disposed || host.hidden) return;
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };
    const fit = (bounds, top = false) => {
      const center = bounds.getCenter(new T.Vector3()), size = bounds.getSize(new T.Vector3());
      const radius = Math.max(size.x, size.y, size.z) * 0.65;
      const distance = radius / Math.sin(camera.fov * Math.PI / 360) / Math.min(camera.aspect, 1);
      camera.position.copy(center).add(new T.Vector3(...(top ? [0, -0.001, 1] : [0.35, -0.9, 0.8])).normalize().multiplyScalar(distance));
      controls.target.copy(center);
      controls.update();
      render();
    };
    const zoom = factor => {
      const offset = camera.position.clone().sub(controls.target);
      const distance = Math.max(controls.minDistance, Math.min(controls.maxDistance, offset.length() * factor));
      camera.position.copy(controls.target).add(offset.setLength(distance));
      controls.update();
      render();
    };
    controls.addEventListener('change', render);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    canvas.addEventListener('keydown', event => {
      if (['+', '=', '-', 'Home'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'Home') fit(panelBounds);
        else zoom(event.key === '-' ? 1.25 : 0.8);
      }
    });
    canvas.addEventListener('webglcontextlost', event => {
      if (disposed) return;
      event.preventDefault();
      dispose();
      onFailure();
    });
    return {
      resize, dispose,
      action(action) {
        resize();
        if (action === 'in' || action === 'out') zoom(action === 'in' ? 0.8 : 1.25);
        else fit(action === 'site' ? siteBounds : panelBounds, action === 'top');
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export function initPvsimViewer(gallery, m) {
  const host = gallery.querySelector('[data-pvsim-viewer]');
  const start = gallery.querySelector('[data-pvsim-start]');
  const status = gallery.querySelector('[data-pvsim-status]');
  const poster = gallery.querySelector('.product-screen-open');
  let selected = true, active = false, loading = false, failed = false, runtime, closed = false;
  const sync = () => {
    const visible = selected && active && !!runtime;
    host.hidden = !visible;
    poster.hidden = visible;
    start.hidden = !selected || visible;
    start.disabled = loading;
    start.textContent = loading ? m.loading : m.start;
    status.hidden = !selected || !failed;
    status.textContent = failed ? m.unavailable : '';
    runtime?.resize();
  };
  const fail = () => { runtime = undefined; active = false; failed = true; sync(); };
  start.addEventListener('click', async () => {
    if (loading || closed) return;
    loading = true; failed = false; sync();
    try {
      const fresh = !runtime;
      runtime ??= await createViewer(host, m, fail);
      if (closed) { runtime.dispose(); return; }
      active = true; loading = false; sync();
      if (fresh) runtime.action('home');
      if (selected) host.querySelector('canvas').focus({ preventScroll: true });
    } catch { fail(); }
    finally { loading = false; sync(); }
  });
  for (const button of host.querySelectorAll('[data-pvsim-action]')) button.addEventListener('click', () => {
    if (button.dataset.pvsimAction === 'exit') {
      active = false; sync(); start.focus({ preventScroll: true });
    } else runtime?.action(button.dataset.pvsimAction);
  });
  addEventListener('pagehide', event => {
    if (event.persisted) return;
    closed = true; runtime?.dispose();
  });
  return { setSelected(value) { selected = value; sync(); } };
}
