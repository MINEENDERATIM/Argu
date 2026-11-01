import { sanitizeText, toAbsoluteUrl } from '../shared/utils';

export interface FontFaceRecord {
  family: string;
  style: string;
  weight: string;
  source: string;
}

export interface PseudoElementInfo {
  selector: string;
  content: string;
  styles: Record<string, string>;
}

export function discoverFonts(): { fonts: FontFaceRecord[]; pseudoElements: PseudoElementInfo[] } {
  const fonts: FontFaceRecord[] = [];
  const pseudoElements: PseudoElementInfo[] = [];

  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule) => {
          if (rule.type !== CSSRule.FONT_FACE_RULE) return;
          const fontFaceRule = rule as CSSFontFaceRule;
          const style = fontFaceRule.style as CSSStyleDeclaration;
          const family = sanitizeText(style.getPropertyValue('font-family')) || 'Unknown';
          const weight = sanitizeText(style.getPropertyValue('font-weight')) || '400';
          const fontStyle = sanitizeText(style.getPropertyValue('font-style')) || 'normal';
          const source = sanitizeText(style.getPropertyValue('src')) || '';
          fonts.push({
            family,
            style: fontStyle,
            weight,
            source: source ? toAbsoluteUrl(source) : ''
          });
        });
      } catch {
        // Ignore inaccessible stylesheets.
      }
    });
  } catch {
    // Ignore fonts discovery failures.
  }

  const selected = Array.from(document.querySelectorAll('*')).slice(0, 25);
  selected.forEach((element) => {
    const pseudoNames: Array<'::before' | '::after'> = ['::before', '::after'];
    pseudoNames.forEach((pseudoSelector) => {
      const css = getComputedStyle(element, pseudoSelector);
      const content = css.getPropertyValue('content');
      const styles: Record<string, string> = {};
      ['content', 'display', 'position', 'font-family', 'font-size', 'font-weight', 'color', 'background', 'content'].forEach((key) => {
        const value = css.getPropertyValue(key);
        if (value) styles[key] = value;
      });
      if (content && content !== 'none') {
        pseudoElements.push({
          selector: `${element.tagName.toLowerCase()}${pseudoSelector}`,
          content: sanitizeText(content),
          styles
        });
      }
    });
  });

  return { fonts, pseudoElements };
}
