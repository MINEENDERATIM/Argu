import { sanitizeText, truncateText } from '../shared/utils';

export interface PayloadContext {
  title: string;
  mode: 'component' | 'page';
  framework: string[];
  html: string;
  css: Record<string, string>;
  fonts: Array<Record<string, unknown>>;
  pseudoElements: Array<Record<string, unknown>>;
  animation: { [key: string]: any };
  screenshot?: string;
  sourceUrl: string;
}

export function buildPayload(context: PayloadContext): string {
  const safeHtml = sanitizeText(context.html).slice(0, 20000);
  const cssText = Object.entries(context.css)
    .map(([key, value]) => `- ${key}: ${value};`)
    .join('\n');

  const sections = [
    '# Advait Extraction',
    '',
    `- Mode: ${context.mode}`,
    `- URL: ${context.sourceUrl}`,
    `- Frameworks: ${context.framework.join(', ') || 'Unknown'}`,
    '',
    '## Instructions',
    '',
    'Recreate this UI in a local implementation using the supplied HTML, computed styles, animation notes, framework hints, and screenshots. Preserve the visual hierarchy and semantics where possible. If the original framework is not directly available, reproduce the interface in a clean, framework-neutral implementation that matches the captured design.',
    '',
    '## Original HTML',
    '',
    '```html',
    safeHtml || '<html></html>',
    '```',
    '',
    '## Computed CSS',
    '',
    '```css',
    cssText || '/* No CSS extracted */',
    '```',
    '',
    '## Fonts',
    '',
    JSON.stringify(context.fonts, null, 2),
    '',
    '## Pseudo-elements',
    '',
    JSON.stringify(context.pseudoElements, null, 2),
    '',
    '## Animation & interactions',
    '',
    JSON.stringify(context.animation, null, 2),
    '',
    '## Screenshot',
    '',
    context.screenshot ? `![Screenshot](${context.screenshot})` : 'No screenshot captured.',
    ''
  ].join('\n');

  return truncateText(sections, 80000);
}
