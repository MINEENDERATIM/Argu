import { extractSelection } from './extractor';
import { attachSelectionOverlay } from './overlay';

if (!(window as Window & { __advaitInitialized?: boolean }).__advaitInitialized) {
  (window as Window & { __advaitInitialized?: boolean }).__advaitInitialized = true;
  attachSelectionOverlay();

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'advait:extract') {
      void (async () => {
        try {
          const result = await extractSelection(message.mode ?? 'component', Boolean(message.includeScreenshot));
          sendResponse(result);
        } catch (error) {
          sendResponse({
            type: 'advait:result',
            ok: false,
            payload: error instanceof Error ? error.message : 'Unknown extraction error.'
          });
        }
      })();
      return true;
    }

    return false;
  });
}
