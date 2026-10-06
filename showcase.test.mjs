import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {industries, features, productsFor, filterFeatures, selectionSummary} = require('./showcase.js');
const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');

test('each industry has distinct synthetic product choices', () => {
  assert.equal(industries.length, 7);
  const allIds = [];
  for (const industry of industries) {
    const products = productsFor(industry.id);
    assert.equal(products.length, 3);
    assert.ok(products.every(item => item.title.startsWith('示範') && item.description.includes('虛構')));
    allIds.push(...products.map(item => item.id));
  }
  assert.equal(new Set(allIds).size, allIds.length);
  assert.deepEqual(productsFor('unknown'), productsFor('vip'));
});

test('feature search supports empty, Chinese, mixed case and category filters', () => {
  assert.equal(filterFeatures('', 'all').length, features.length);
  assert.equal(filterFeatures('付款', 'all')[0].title, '訂單、付款與配送');
  assert.equal(filterFeatures(' email ', 'all').length, 1);
  assert.equal(filterFeatures('ＥＭＡＩＬ', 'all').length, 1);
  assert.equal(filterFeatures('', 'training').length, 3);
  assert.equal(filterFeatures('付款', 'customer').length, 0);
  assert.equal(filterFeatures('<script>test</script>', 'all').length, 0);
});

test('selection summary ignores stale or unknown products', () => {
  assert.match(selectionSummary('vip', new Set()), /尚未選取/);
  assert.match(selectionSummary('vip', new Set(['vip-1', 'vip-3'])), /已選 2 項/);
  assert.match(selectionSummary('interior', new Set(['vip-1'])), /尚未選取/);
  assert.match(selectionSummary('interior', new Set(['interior-1', 'unknown'])), /已選 1 項/);
});

test('demo has no network calls, persistence, HTML injection or external assets', () => {
  const script = read('showcase.js');
  assert.doesNotMatch(script, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|localStorage|sessionStorage)\b|sendBeacon|document\.cookie|innerHTML|eval\s*\(/);
  const html = read('index.html');
  assert.doesNotMatch(html, /(?:src|action)=["']https?:\/\//i);
  assert.doesNotMatch(read('styles.css'), /@import|url\s*\(/);
  assert.match(html, /虛構示範資料/);
  assert.match(html, /aria-live="polite"/);
});

test('public file allowlist excludes source, credentials, data and build output', () => {
  const allowed = ['.git', '.gitignore', 'README.md', 'index.html', 'styles.css', 'showcase.js', 'showcase.test.mjs'];
  for (const filename of readdirSync(new URL('.', import.meta.url))) assert.ok(allowed.includes(filename), `Unexpected file: ${filename}`);
  for (const filename of allowed.filter(name => name !== '.git')) {
    const content = read(filename);
    assert.doesNotMatch(content, /(?:sk-proj-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{20,}|hf_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN[ ]PRIVATE[ ]KEY-----)/);
    assert.doesNotMatch(content, /github\.com\/jpgdesign\/sales-pilot-AI(?:["'\s/)]|$)/);
  }
});
