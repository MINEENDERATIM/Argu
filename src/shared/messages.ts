export type CaptureMode = 'component' | 'page';

export interface ExtractRequest {
  type: 'advait:request';
  mode: CaptureMode;
  includeScreenshot?: boolean;
}

export interface ContentScriptResult {
  type: 'advait:result';
  ok: boolean;
  payload: string;
  screenshot?: string;
  metadata?: Record<string, unknown>;
}

export type AdvaitMessage = ExtractRequest | ContentScriptResult;
