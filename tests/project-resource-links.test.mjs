import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const resources = [
  ['Paper', 'https://github.com/QwenLM/BlenderWorld/blob/main/docs/BlenderWorld__Benchmarking_Visual_Agents_for_3D_Creation_from_Real_World_References.pdf'],
  ['GitHub', 'https://github.com/QwenLM/BlenderWorld'],
  ['Hugging Face', 'https://huggingface.co/datasets/Qwen/BlenderWorld'],
  ['ModelScope', 'https://modelscope.cn/datasets/Qwen/BlenderWorld'],
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('hero exposes the four official project resources safely and in order', () => {
  const navMatch = html.match(/<nav class="project-links"[^>]*>[\s\S]*?<\/nav>/);
  assert.ok(navMatch, 'missing nav.project-links');
  const nav = navMatch[0];
  const anchors = [...nav.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
  assert.equal(anchors.length, resources.length);

  let previousPosition = -1;
  resources.forEach(([label, url], index) => {
    const anchor = anchors[index];
    assert.match(anchor, new RegExp(`href="${escapeRegex(url)}"`));
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
    assert.match(anchor, /aria-label="[^"]+\(opens in a new tab\)"/);
    assert.match(anchor, new RegExp(`>${escapeRegex(label)} <span aria-hidden="true">↗<\\/span>`));
    assert.equal((nav.match(new RegExp(`href="${escapeRegex(url)}"`, 'g')) ?? []).length, 1);
    const position = nav.indexOf(`href="${url}"`);
    assert.ok(position > previousPosition, `${label} is out of order`);
    previousPosition = position;
  });
});
