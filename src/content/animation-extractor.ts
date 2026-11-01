import { sanitizeText } from '../shared/utils';

export interface AnimationSummary {
  transitions: Record<string, string>;
  keyframes: string[];
  webAnimations: string[];
  pseudoStates: Record<string, boolean>;
}

export function collectAnimationData(target: Element): AnimationSummary {
  const style = getComputedStyle(target);
  const transitions: Record<string, string> = {};
  const transitionProps = style.transitionProperty.split(',').map((item) => item.trim()).filter(Boolean);
  transitionProps.forEach((property) => {
    const duration = style.transitionDuration;
    const delay = style.transitionDelay;
    const timing = style.transitionTimingFunction;
    transitions[property] = `${duration} ${delay} ${timing}`;
  });

  const keyframes: string[] = [];
  const sheets = Array.from(document.styleSheets);
  sheets.forEach((sheet) => {
    try {
      Array.from(sheet.cssRules || []).forEach((rule) => {
        const keyframesRule = rule as CSSKeyframesRule;
        if (rule.type === CSSRule.KEYFRAMES_RULE && 'name' in keyframesRule) {
          keyframes.push((keyframesRule as CSSKeyframesRule).name);
        }
      });
    } catch {
      // Ignore cross-origin or blocked sheets.
    }
  });

  const webAnimations: string[] = [];
  const animations = (target as Element & { getAnimations?: () => Array<{ effect?: any }> }).getAnimations?.() ?? [];
  animations.forEach((animation) => {
    const effect = (animation as any).effect;
    const name = effect?.target ? (effect.target as Element).tagName : 'anonymous';
    const duration = effect?.timing?.duration ?? 0;
    webAnimations.push(`${name}:${duration}ms`);
  });

  const pseudoStates: Record<string, boolean> = {
    hover: target.matches(':hover'),
    active: target.matches(':active'),
    focus: target.matches(':focus'),
    focusWithin: target.matches(':focus-within'),
    focusVisible: target.matches(':focus-visible')
  };

  return {
    transitions,
    keyframes: [...new Set(keyframes)],
    webAnimations: [...new Set(webAnimations)],
    pseudoStates: Object.fromEntries(Object.entries(pseudoStates).map(([key, value]) => [key, Boolean(value)]))
  };
}
