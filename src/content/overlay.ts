import { resolveAncestorFromDirection, resolveElementFromPoint, getSelectedElement, setSelectedElement } from './extractor';

let initialized = false;

function setupHighlight(element: Element | null): void {
  document.querySelectorAll('[data-advait-highlight]').forEach((node) => node.removeAttribute('data-advait-highlight'));
  if (!element) return;

  element.setAttribute('data-advait-highlight', 'true');
  const existing = element as HTMLElement;
  existing.style.outline = '2px solid rgba(56, 189, 248, 0.95)';
  existing.style.boxShadow = '0 0 0 9999px rgba(15, 23, 42, 0.12)';
}

export function attachSelectionOverlay(): void {
  if (initialized || !document.body) return;
  initialized = true;

  const host = document.createElement('div');
  host.id = 'advait-selection-host';
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '2147483647';
  host.style.display = 'block';
  document.body.appendChild(host);

  document.addEventListener('mousemove', (event) => {
    const element = resolveElementFromPoint(event.clientX, event.clientY);
    if (element) {
      setupHighlight(element);
      setSelectedElement(element);
    }
  });

  document.addEventListener('click', (event) => {
    const element = resolveElementFromPoint(event.clientX, event.clientY);
    if (element) {
      setSelectedElement(element);
      setupHighlight(element);
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    const current = getSelectedElement();
    if (!current) return;

    const next = (() => {
      switch (event.key) {
        case 'ArrowUp':
          return resolveAncestorFromDirection(current, 'up');
        case 'ArrowDown':
          return resolveAncestorFromDirection(current, 'down');
        case 'ArrowLeft':
          return resolveAncestorFromDirection(current, 'left');
        case 'ArrowRight':
          return resolveAncestorFromDirection(current, 'right');
        default:
          return current;
      }
    })();

    if (next) {
      event.preventDefault();
      setSelectedElement(next);
      setupHighlight(next);
    }
  });
}

export function getSelectionState(): Element | null {
  return getSelectedElement();
}
