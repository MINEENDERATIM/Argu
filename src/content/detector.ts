export interface FrameworkInfo {
  names: string[];
  details: Record<string, string>;
}

export function detectFramework(doc: Document): FrameworkInfo {
  const details: Record<string, string> = {};
  const names: string[] = [];

  const check = (name: string, value: string) => {
    if (!names.includes(name)) {
      names.push(name);
    }
    details[name] = value;
  };

  const win = doc.defaultView as Window & {
    __NEXT_DATA__?: unknown;
    __NUXT__?: unknown;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
  };

  if (win.__NEXT_DATA__) check('Next.js', 'Detected __NEXT_DATA__ on window.');
  if (win.__NUXT__) check('Nuxt', 'Detected __NUXT__ on window.');
  if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) check('React', 'Detected React devtools hook.');
  if (doc.querySelector('[data-reactroot]')) check('React', 'Detected data-reactroot attribute.');
  if (doc.querySelector('[data-v-app]')) check('Vue', 'Detected Vue app root.');
  if (doc.querySelector('ng-app, [ng-app]')) check('Angular', 'Detected Angular bootstrap marker.');
  if (doc.querySelector('sveltekit\\:head, svelte\\:head')) check('Svelte', 'Detected Svelte root markers.');
  if (doc.querySelector('astro-root')) check('Astro', 'Detected Astro root marker.');
  if (doc.querySelector('script[src*="shopify"], [data-shopify]')) {
    check('Shopify', 'Detected Shopify markers.');
  }
  if (doc.querySelector('wp-admin, .wp-site-blocks')) check('WordPress', 'Detected WordPress core selectors.');
  if (doc.querySelector('script[src*="webflow"], [data-wf-]')) check('Webflow', 'Detected Webflow markers.');
  if (doc.querySelector('script[src*="framer"], [data-framer]')) check('Framer', 'Detected Framer markers.');
  if (doc.querySelector('[data-wix]')) check('Wix', 'Detected Wix markers.');
  if (doc.querySelector('.sqs-block')) check('Squarespace', 'Detected Squarespace markers.');

  if (names.length === 0) {
    check('Unknown', 'No framework markers were detected reliably.');
  }

  return { names, details };
}
