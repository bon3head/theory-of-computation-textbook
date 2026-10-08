const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'tts.js'), 'utf8');

function setup({ speech = true, textNodes = null } = {}) {
  const attrs = {};
  const listeners = {};
  const button = {
    disabled: false,
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: k => attrs[k],
    addEventListener: (type, fn) => { button.onclick = fn; },
    click: () => { if (!button.disabled && button.onclick) button.onclick(); },
  };
  const status = { textContent: '' };
  const main = { innerText: 'Hello regular world' };
  const synth = { spoken: [], cancelled: 0, speak: u => synth.spoken.push(u), cancel: () => synth.cancelled++ };
  const sandbox = {
    document: {
      getElementById: id => ({ 'tts-toggle': button, 'tts-status': status })[id],
      querySelector: sel => (sel === 'main' ? main : null),
    },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
  };
  if (speech) sandbox.speechSynthesis = synth;
  if (textNodes) {
    sandbox.NodeFilter = { SHOW_TEXT: 4 };
    sandbox.CSS = { highlights: new Map() };
    sandbox.Highlight = class { constructor(range) { this.range = range; } };
    sandbox.Range = class {
      setStart(node, offset) { this.node = node; this.start = offset; }
      setEnd(node, offset) { this.end = offset; }
    };
    sandbox.document.createTreeWalker = () => {
      let i = -1;
      return {
        nextNode: () => textNodes[++i] ?? null,
        set currentNode(node) { i = textNodes.indexOf(node); },
      };
    };
  }
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return { button, status, synth, listeners, sandbox };
}

test('first click starts reading <main>', () => {
  const { button, status, synth } = setup();
  button.click();
  assert.equal(synth.spoken[0].text, 'Hello regular world');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(status.textContent, 'Reading the page aloud.');
});

test('second click stops reading', () => {
  const { button, status, synth } = setup();
  button.click();
  button.click();
  assert.equal(synth.cancelled, 1);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(status.textContent, 'Stopped reading.');
});

test('end of speech resets the button', () => {
  const { button, status, synth } = setup();
  button.click();
  synth.spoken[0].onend();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(status.textContent, 'Stopped reading.');
});

test('end event from a replaced utterance is ignored', () => {
  const { button, synth } = setup();
  button.click();
  button.click();
  button.click();
  synth.spoken[0].onend();
  assert.equal(button.getAttribute('aria-pressed'), 'true');
});

test('speech that fails at once leaves the button unpressed', () => {
  const { button, status, synth } = setup();
  synth.speak = u => u.onerror();
  button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(status.textContent, 'Stopped reading.');
});

test('missing speechSynthesis disables the button and says why', () => {
  const { button, status } = setup({ speech: false });
  button.click();
  assert.equal(button.disabled, true);
  assert.equal(status.textContent, 'Text-to-speech is not available in this browser.');
});

test('pagehide stops reading', () => {
  const { button, synth, listeners } = setup();
  button.click();
  listeners.pagehide();
  assert.equal(synth.cancelled, 1);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
});

test('highlights each spoken word and survives a word split across tags', () => {
  const nodes = [{ data: 'Hello ' }, { data: 're' }, { data: 'gular world' }];
  const { button, synth, sandbox } = setup({ textNodes: nodes });
  button.click();
  const highlighted = () => {
    const { range } = sandbox.CSS.highlights.get('tts-word');
    return [range.node.data, range.start, range.end];
  };
  synth.spoken[0].onboundary({ name: 'word', charIndex: 0 });
  assert.deepEqual(highlighted(), ['Hello ', 0, 5]);
  synth.spoken[0].onboundary({ name: 'word', charIndex: 6 });
  assert.deepEqual(highlighted(), ['Hello ', 0, 5]);
  synth.spoken[0].onboundary({ name: 'word', charIndex: 14 });
  assert.deepEqual(highlighted(), ['gular world', 6, 11]);
});

test('without the Highlight API, speech still works and no highlight handler is set', () => {
  const { button, synth } = setup();
  button.click();
  assert.equal(synth.spoken[0].text, 'Hello regular world');
  assert.equal(synth.spoken[0].onboundary, undefined);
});
