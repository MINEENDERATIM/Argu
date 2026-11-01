import { type CaptureMode } from '../shared/messages';
import { sanitizeText, toAbsoluteUrl } from '../shared/utils';
import { collectAnimationData } from './animation-extractor';
import { detectFramework } from './detector';
import { discoverFonts } from './font-extractor';
import { buildPayload } from './payload-builder';

const STYLE_PROPERTIES = [
  'align-items', 'align-content', 'background', 'background-color', 'background-image', 'border', 'border-bottom',
  'border-color', 'border-left', 'border-radius', 'border-right', 'border-style', 'border-top', 'border-width',
  'box-shadow', 'box-sizing', 'color', 'cursor', 'display', 'filter', 'flex', 'flex-basis', 'flex-direction', 'flex-grow',
  'flex-shrink', 'font', 'font-family', 'font-size', 'font-style', 'font-weight', 'gap', 'grid', 'grid-area', 'grid-auto-flow',
  'grid-column', 'grid-template-columns', 'grid-template-rows', 'height', 'justify-content', 'letter-spacing', 'line-height',
  'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'max-height', 'max-width', 'min-height', 'min-width',
  'opacity', 'overflow', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'position', 'right','left',
  'top', 'bottom', 'text-align', 'text-decoration', 'text-transform', 'transform', 'transform-origin', 'transition',
  'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function', 'user-select', 'vertical-align',
  'visibility', 'white-space', 'width', 'word-break', 'z-index', 'background-clip', 'backdrop-filter', 'outline', 'outline-offset',
  'direction', 'object-fit', 'place-items', 'place-content', 'writing-mode', 'text-shadow', 'shadow', 'border-collapse', 'column-gap', 'row-gap'
];

function getMeaningfulRoot(root: Element | null): Element {
  const fallback = document.body || document.documentElement;
  if (!root || root.nodeType !== Node.ELEMENT_NODE) return fallback;
  let target: Element | null = root;
  while (target && target !== document.body) {
    if (target.children.length > 0 && (target.textContent || '').trim().length > 10) {
      return target;
    }
    target = target.parentElement;
  }
  return fallback;
}

function collectCssStyles(target: Element): Record<string, string> {
  const computed = getComputedStyle(target);
  const css: Record<string, string> = {};
  for (const property of STYLE_PROPERTIES) {
    const value = computed.getPropertyValue(property);
    if (value && value !== 'initial' && value !== 'normal') {
      css[property] = value;
    }
  }

  const beforeStyles = getComputedStyle(target, '::before');
  const afterStyles = getComputedStyle(target, '::after');
  for (const [pseudoName, pseudoStyle] of [['::before', beforeStyles], ['::after', afterStyles]] as const) {
    const content = pseudoStyle.getPropertyValue('content');
    if (content && content !== 'none') {
      css[`${pseudoName} content`] = content;
    }
  }

  return css;
}

function extractAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  Array.from(element.attributes).forEach((attribute) => {
    if (['style', 'src', 'href'].includes(attribute.name) || !attribute.value) return;
    attrs[attribute.name] = attribute.value;
  });

  return attrs;
}

function buildDomSummary(root: Element): { tagName: string; id: string; classes: string[]; text: string; attrs: Record<string, string>; styles: Record<string, string> } {
  const styles = collectCssStyles(root);
  const tagName = root.tagName.toLowerCase();
  return {
    tagName,
    id: root.id,
    classes: Array.from(root.classList),
    text: sanitizeText(root.textContent).slice(0, 300),
    attrs: extractAttributes(root),
    styles
  };
}

function extractHtmlForRoot(root: Element): string {
  const node = root.cloneNode(true) as Element;
  if (node instanceof HTMLElement) {
    node.querySelectorAll('script, style').forEach((child) => child.remove());
  }
  return node.outerHTML.slice(0, 20000);
}

export async function extractSelection(mode: CaptureMode, includeScreenshot = false): Promise<{ type: 'advait:result'; ok: boolean; payload: string; screenshot?: string; metadata?: Record<string, unknown> }> {
  const root = mode === 'component' ? getMeaningfulRoot((window as Window & { __advaitSelectedElement?: Element | null }).__advaitSelectedElement ?? null) : document.body || document.documentElement;
  const html = extractHtmlForRoot(root);
  const css: Record<string, string> = {};
  const descendants = Array.from(root.querySelectorAll('*')).slice(0, 12);
  const rootSummary = buildDomSummary(root);
  Object.assign(css, rootSummary.styles);
  descendants.forEach((element) => Object.assign(css, collectCssStyles(element)));

  const fonts = discoverFonts();
  const framework = detectFramework(document);
  const animation = collectAnimationData(root);
  const screenshot = undefined;

  const payload = buildPayload({
    title: mode === 'component' ? 'Component capture' : 'Page capture',
    mode,
    framework: framework.names,
    html,
    css,
    fonts: fonts.fonts.map((font) => ({ ...font })),
    pseudoElements: fonts.pseudoElements.map((item) => ({ ...item })),
    animation,
    screenshot,
    sourceUrl: window.location.href
  });

  return {
    type: 'advait:result',
    ok: true,
    payload,
    screenshot,
    metadata: {
      mode,
      url: window.location.href,
      framework: framework.names,
      selectedTag: root.tagName,
      descendantCount: descendants.length,
      screenshotCaptured: Boolean(screenshot)
    }
  };
}

export function getSelectedElement(): Element | null {
  return (window as Window & { __advaitSelectedElement?: Element | null }).__advaitSelectedElement ?? null;
}

export function setSelectedElement(element: Element | null): void {
  (window as Window & { __advaitSelectedElement?: Element | null }).__advaitSelectedElement = element;
}

export function resolveElementFromPoint(x: number, y: number): Element | null {
  const target = document.elementFromPoint(x, y) as Element | null;
  if (!target) return null;
  let current: Element | null = target;
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    if (['button', 'input', 'label', 'section', 'article', 'nav', 'header', 'main', 'aside', 'footer', 'form', 'div', 'span', 'li', 'ul', 'ol', 'table'].includes(tag) || current.classList.length > 0) {
      return current;
    }
    current = current.parentElement;
  }
  return target;
}

export function resolveAncestorFromDirection(current: Element | null, direction: 'up' | 'down' | 'left' | 'right'): Element | null {
  if (!current) return null;
  const all = Array.from(document.querySelectorAll('*'));
  const index = all.indexOf(current);
  if (index === -1) return current;

  switch (direction) {
    case 'up':
      return current.parentElement ?? current;
    case 'down':
      return (current.firstElementChild ?? current.parentElement ?? current);
    case 'left':
      return all[Math.max(0, index - 1)] ?? current;
    case 'right':
      return all[Math.min(all.length - 1, index + 1)] ?? current;
    default:
      return current;
  }
}

export function normaliseUrl(value: string): string {
  return toAbsoluteUrl(value);
}
