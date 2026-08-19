(() => {
  const EM_DASH = '\u2014';
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);
  const VISIBLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'aria-description'];

  function cleanCopy(value) {
    const text = String(value ?? '');
    if (!text.includes(EM_DASH)) return text;

    // A standalone em dash is being used as an empty-value placeholder,
    // not as sentence punctuation. Show a clear N/A instead.
    if (text.trim() === EM_DASH) return text.replace(EM_DASH, 'N/A');

    // Only remove actual em dashes. Normal hyphens (-), en dashes (–),
    // minus signs (−), ranges, and hyphenated words are left untouched.
    return text
      .replace(/\s*\u2014\s*/g, ', ')
      .replace(/\s+,/g, ',')
      .replace(/,\s*,+/g, ', ');
  }

  function cleanTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (!parent || SKIP_TAGS.has(parent.tagName)) return;
    const next = cleanCopy(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function cleanAttributes(element) {
    if (!(element instanceof Element) || SKIP_TAGS.has(element.tagName)) return;
    VISIBLE_ATTRIBUTES.forEach(name => {
      if (!element.hasAttribute(name)) return;
      const current = element.getAttribute(name) || '';
      const next = cleanCopy(current);
      if (next !== current) element.setAttribute(name, next);
    });
  }

  function cleanTree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      cleanTextNode(root);
      return;
    }
    if (!(root instanceof Element) && root !== document.body) return;
    if (root instanceof Element) cleanAttributes(root);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (node.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has(node.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) cleanTextNode(node);
      else cleanAttributes(node);
      node = walker.nextNode();
    }
  }

  function start() {
    cleanTree(document.body);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') {
          cleanTextNode(mutation.target);
          return;
        }
        if (mutation.type === 'attributes') {
          cleanAttributes(mutation.target);
          return;
        }
        mutation.addedNodes.forEach(cleanTree);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: VISIBLE_ATTRIBUTES
    });

    window.addEventListener('pageshow', () => cleanTree(document.body));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') cleanTree(document.body);
    });
  }

  window.LevelUpCopyCleanup = { clean: () => cleanTree(document.body) };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
