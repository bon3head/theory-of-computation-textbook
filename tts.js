const button = document.getElementById('tts-toggle');
const status = document.getElementById('tts-status');
const synth = window.speechSynthesis;
const canHighlight = window.CSS?.highlights && window.Highlight;
let utterance = null;

function stop() {
  utterance = null;
  synth.cancel();
  if (canHighlight) CSS.highlights.delete('tts-word');
  button.setAttribute('aria-pressed', 'false');
  status.textContent = 'Stopped reading.';
}

function start() {
  const main = document.querySelector('main');
  const text = main.innerText;
  const u = utterance = new SpeechSynthesisUtterance(text);
  u.onend = u.onerror = () => { if (utterance === u) stop(); };

  if (canHighlight) {
    // Words are spoken in order, so search forward from the last match.
    // On a miss (e.g. a word split across tags), rewind so one odd word
    // does not end highlighting for the rest of the page.
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode(), from = 0;
    u.onboundary = e => {
      const word = e.name === 'word' && text.slice(e.charIndex).match(/\S+/)?.[0];
      if (!word) return;
      for (let n = node, start = from; n; n = walker.nextNode(), start = 0) {
        const at = n.data.indexOf(word, start);
        if (at < 0) continue;
        const range = new Range();
        range.setStart(n, at);
        range.setEnd(n, at + word.length);
        CSS.highlights.set('tts-word', new Highlight(range));
        node = n;
        from = at + word.length;
        return;
      }
      walker.currentNode = node;
    };
  }

  button.setAttribute('aria-pressed', 'true');
  status.textContent = 'Reading the page aloud.';
  synth.speak(u);
}

if (synth) {
  button.addEventListener('click', () => utterance ? stop() : start());
  addEventListener('pagehide', stop);
} else {
  button.disabled = true;
  status.textContent = 'Text-to-speech is not available in this browser.';
}
