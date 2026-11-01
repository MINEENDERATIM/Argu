import type { ContentScriptResult, ExtractRequest } from '../shared/messages';

const sendToTab = async (tabId: number, message: Record<string, unknown>): Promise<ContentScriptResult> => {
  return await new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          type: 'advait:result',
          ok: false,
          payload: chrome.runtime.lastError.message || 'Failed to reach content script.'
        });
        return;
      }
      resolve((response as ContentScriptResult) ?? {
        type: 'advait:result',
        ok: false,
        payload: 'No response received from the page.'
      });
    });
  });
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'advait:request') {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        sendResponse({
          type: 'advait:result',
          ok: false,
          payload: 'An active Chrome tab is required.'
        } as ContentScriptResult);
        return;
      }

      const contentResult = await sendToTab(tab.id, {
        type: 'advait:extract',
        mode: message.mode,
        includeScreenshot: Boolean(message.includeScreenshot)
      });

      if (message.includeScreenshot && !contentResult.screenshot) {
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId ?? tab.id, { format: 'jpeg', quality: 80 });
        contentResult.screenshot = screenshot;
      }

      sendResponse(contentResult);
    })();
    return true;
  }

  if (message.type === 'advait:screenshot') {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        sendResponse({ screenshot: '' });
        return;
      }
      const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId ?? tab.id, { format: 'jpeg', quality: 85 });
      sendResponse({ screenshot: screenshot ?? '' });
    })();
    return true;
  }

  return false;
});
