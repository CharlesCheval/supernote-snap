/** Debug trace: every pen-up event and every stage of each handled stroke. */
import {PluginCommAPI, PluginFileAPI, PluginNoteAPI} from 'sn-plugin-lib';
import {getSettings} from './settings';

const on = () => getSettings().diagnostics;

export type StrokeTrace = {start: number; lines: string[]};

const MAX_TRACES = 6;
const MAX_EVENTS = 25;
export const strokeTraces: StrokeTrace[] = [];
export const events: string[] = [];
let cur: StrokeTrace | null = null;


function pad(n: number, w = 2) {
  return String(n).padStart(w, '0');
}
export function clock(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function beginTrace(line: string) {
  if (!on()) {
    cur = null;
    return;
  }
  cur = {start: Date.now(), lines: []};
  strokeTraces.unshift(cur);
  if (strokeTraces.length > MAX_TRACES) {
    strokeTraces.pop();
  }
  t(line);
}

export function t(line: string) {
  if (cur) {
    cur.lines.push(`+${Date.now() - cur.start} ${line}`);
  }
}

export function ev(line: string) {
  if (!on()) {
    return;
  }
  events.unshift(`${clock(Date.now())} ${line}`);
  if (events.length > MAX_EVENTS) {
    events.pop();
  }
}

export function traceText(tr: StrokeTrace): string {
  return [clock(tr.start), ...tr.lines].join('\n');
}

export function r(v: number) {
  return Math.round(v);
}

export function resp(res: any): string {
  if (res == null) {
    return 'null';
  }
  if (res.success) {
    const v = res.result;
    return `ok ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`.slice(0, 200);
  }
  return `FAIL ${res.error?.message ?? '?'} (code ${res.error?.code ?? '?'})`;
}

/** Writes the current trace on the page as a text box, top-left. */
export async function writeOnPage(page: number) {
  if (!on() || !getSettings().pageText || !cur) {
    return;
  }
  const text = traceText(cur).slice(0, 4000);
  try {
    const path: any = await PluginCommAPI.getCurrentFilePath();
    const real: any = path?.success ? await PluginFileAPI.getPageSize(path.result, page) : null;
    const w = real?.success ? real.result.width : 1404;
    const res: any = await PluginNoteAPI.insertText({
      fontSize: 22,
      textContentFull: text,
      textRect: {left: 30, top: 30, right: Math.round(w * 0.6), bottom: 30 + 40 * (text.split('\n').length + 1)},
      textAlign: 0,
      textBold: 0,
      textItalics: 0,
      textFrameWidthType: 0,
      textFrameStyle: 0,
      textEditable: 0,
    });
    t(`page text: ${resp(res)}`);
  } catch (e: any) {
    t(`page text threw: ${e?.message ?? e}`);
  }
}
