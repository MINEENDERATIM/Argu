import { useEffect, useMemo, useState } from 'react';
import type { CaptureMode } from '../shared/messages';

function App() {
  const [mode, setMode] = useState<CaptureMode>('component');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [status, setStatus] = useState('Ready');
  const [payload, setPayload] = useState('');
  const [screenshot, setScreenshot] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['advaitMode', 'advaitScreenshot'], (items) => {
      if (items.advaitMode === 'page' || items.advaitMode === 'component') {
        setMode(items.advaitMode);
      }
      if (typeof items.advaitScreenshot === 'boolean') {
        setIncludeScreenshot(items.advaitScreenshot);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ advaitMode: mode, advaitScreenshot: includeScreenshot });
  }, [mode, includeScreenshot]);

  const modeOptions = useMemo(
    () => [
      { value: 'component' as const, label: 'Component mode' },
      { value: 'page' as const, label: 'Page mode' }
    ],
    []
  );

  const runExtraction = async () => {
    setStatus('Extracting...');
    try {
      const response = await new Promise<{ ok: boolean; payload: string; screenshot?: string; metadata?: Record<string, unknown> }>((resolve) => {
        chrome.runtime.sendMessage({ type: 'advait:request', mode, includeScreenshot }, (result) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, payload: chrome.runtime.lastError.message || 'Extraction failed.' });
            return;
          }
          resolve(result ?? { ok: false, payload: 'No response from the page.' });
        });
      });

      if (!response.ok) {
        setStatus('Extraction failed');
        setPayload(response.payload || 'Unknown error.');
        return;
      }

      setPayload(response.payload || '');
      setScreenshot(response.screenshot ?? '');
      setStatus('Extracted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error.';
      setStatus('Extraction failed');
      setPayload(message);
    }
  };

  const copyToClipboard = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setStatus('Payload copied to clipboard');
    } catch {
      setStatus('Clipboard access blocked');
    }
  };

  return (
    <div className="advait-popup">
      <header className="popup-header">
        <div>
          <p className="eyebrow">Advait</p>
          <h1>UI extraction</h1>
        </div>
        <span className="status-badge">{status}</span>
      </header>

      <div className="mode-toggle">
        {modeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === mode ? 'active' : ''}
            onClick={() => setMode(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={includeScreenshot}
          onChange={(event) => setIncludeScreenshot(event.target.checked)}
        />
        Include screenshot
      </label>

      <div className="action-row">
        <button type="button" className="primary" onClick={runExtraction}>Inspect page</button>
        <button type="button" className="secondary" onClick={copyToClipboard} disabled={!payload}>Copy payload</button>
      </div>

      {screenshot ? (
        <div className="screenshot-panel">
          <img src={screenshot} alt="Captured screenshot" />
        </div>
      ) : null}

      <div className="payload-panel">
        <pre>{payload || 'No payload yet. Capture a component or the full page to generate an AI-ready extraction.'}</pre>
      </div>
    </div>
  );
}

export default App;
