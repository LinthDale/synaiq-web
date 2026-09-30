import { escapeHtml as e } from './i18n.js';
import { renderPvsimViewer, initPvsimViewer } from './pvsim-viewer.js';

// Captured from the owner's DGX demonstration sites. These are product screens,
// not commissioned-site evidence. See product-screen-provenance.md.
export const productScreens = Object.freeze({
  ems: ['ems-main', 'ems-demand', 'ems-storage'],
  pvsim: ['pvsim-model', 'pvsim-shading', 'pvsim-generation', 'pvsim-wiring'],
});
export const screenPath = name => 'assets/' + name + '-demo.webp';

export function renderProductScreens(product, m) {
  const screens = productScreens[product];
  return `<div class="product-screens" data-product-screens>
    <div class="product-screens-top"><span class="energy-kicker">${e(m.screens.label)}</span><span>${e(m.screens.note)}</span></div>
    <div class="product-screen-select" role="group" aria-label="${e(m.screens.group)}">${screens.map((name, index) => `<button type="button" data-product-screen="${index}" aria-controls="product-screen-view" aria-pressed="${index === 0}"><span>0${index + 1}</span>${e(m.screens.items[index][0])}</button>`).join('')}</div>
    <figure id="product-screen-view" class="product-screen-view">
      <div class="product-screen-media"><a class="product-screen-open" href="${screenPath(screens[0])}" target="_blank" rel="noopener noreferrer" aria-label="${e(m.screens.enlarge)}"><img src="${screenPath(screens[0])}" alt="${e(m.screens.items[0][1])}" loading="lazy" decoding="async"></a>${product === 'pvsim' ? renderPvsimViewer(m.screens.viewer) : ''}</div>
      <figcaption aria-live="polite"><div><strong data-screen-title>${e(m.screens.items[0][0])}</strong><p data-screen-caption>${e(m.screens.items[0][1])}</p></div><a data-screen-enlarge href="${screenPath(screens[0])}" target="_blank" rel="noopener noreferrer">${e(m.screens.enlarge)} <span aria-hidden="true">↗</span></a></figcaption>
    </figure>
  </div>`;
}

export function initProductScreens(root, product, m) {
  const gallery = root.querySelector('[data-product-screens]');
  if (!gallery) return;
  const viewer = product === 'pvsim' ? initPvsimViewer(gallery, m.screens.viewer) : null;
  const buttons = [...gallery.querySelectorAll('[data-product-screen]')];
  for (const button of buttons) button.addEventListener('click', () => {
    const index = Number(button.dataset.productScreen);
    const path = screenPath(productScreens[product][index]);
    const [title, caption] = m.screens.items[index];
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    const img = gallery.querySelector('img');
    img.src = path;
    img.alt = caption;
    gallery.querySelector('.product-screen-open').href = path;
    gallery.querySelector('[data-screen-enlarge]').href = path;
    gallery.querySelector('[data-screen-title]').textContent = title;
    gallery.querySelector('[data-screen-caption]').textContent = caption;
    viewer?.setSelected(index === 0);
  });
}
