// A minimal document.head stand-in for tests that run the shell bootstrap outside a browser.
// It supports only the tag plus attribute-equality selectors the crawl metadata uses, and
// fails loudly on anything else rather than silently matching nothing.
export function createHeadShim(initial = []) {
  const nodes = [];

  function parse(selector) {
    const match = selector.match(/^([a-z]+)((?:\[[\w:-]+="[^"]*"\])*)$/);
    if (!match) throw new Error(`Unsupported selector: ${selector}`);
    return { tag: match[1], attributes: [...match[2].matchAll(/\[([\w:-]+)="([^"]*)"\]/g)].map(([, name, value]) => [name, value]) };
  }

  function matches(node, selector) {
    const { tag, attributes } = parse(selector);
    return node.tag === tag && attributes.every(([name, value]) => node.attributes.get(name) === value);
  }

  function createElement(tag) {
    return {
      tag,
      attributes: new Map(),
      setAttribute(name, value) { this.attributes.set(name, value); },
      getAttribute(name) { return this.attributes.get(name) ?? null; },
      remove() {
        const index = nodes.indexOf(this);
        if (index >= 0) nodes.splice(index, 1);
      },
    };
  }

  const head = {
    querySelector: selector => nodes.find(node => matches(node, selector)) ?? null,
    querySelectorAll: selector => nodes.filter(node => matches(node, selector)),
    append: node => { nodes.push(node); },
  };

  for (const [tag, attributes] of initial) {
    const element = createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    nodes.push(element);
  }
  return { head, createElement, nodes };
}
