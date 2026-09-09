import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const normalize = value => value.trim().replace(/\s+/g, ' ').replace(/\s*([(),:>])\s*/g, '$1');

/** A formatting-independent structural assertion; browser tests verify the cascade. */
export function hasDeclaration(file, selector, property, value, media) {
  const root = postcss.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
  let found = false;
  root.walkRules(rule => {
    if (!postcss.list.comma(rule.selector).some(item => normalize(item) === normalize(selector))) return;
    if (media !== undefined && !(rule.parent.type === 'atrule' && normalize(rule.parent.params) === normalize(media))) return;
    rule.walkDecls(property, declaration => {
      if (normalize(declaration.value) === normalize(value)) found = true;
    });
  });
  return found;
}
