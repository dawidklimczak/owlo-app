import { browser } from '$app/environment';
import en from './en.json';
import pl from './pl.json';

type TranslationTree = { [key: string]: string | TranslationTree };
type Translations = typeof en;

const catalog: Record<string, Translations> = { en, pl };

let _lang = 'en';

function resolve(tree: TranslationTree, keys: string[]): string | undefined {
  const [head, ...rest] = keys;
  const node = tree[head];
  if (node === undefined) return undefined;
  if (rest.length === 0) return typeof node === 'string' ? node : undefined;
  if (typeof node === 'object') return resolve(node as TranslationTree, rest);
  return undefined;
}

export function initI18n(userLang?: string): void {
  if (userLang && catalog[userLang]) {
    _lang = userLang;
    return;
  }
  if (!browser) return;
  const saved = localStorage.getItem('owlo-lang');
  if (saved && catalog[saved]) {
    _lang = saved;
    return;
  }
  const browser_lang = navigator.language.split('-')[0];
  _lang = catalog[browser_lang] ? browser_lang : 'en';
}

export function setLanguage(lang: string): void {
  if (!catalog[lang]) return;
  _lang = lang;
  if (browser) {
    localStorage.setItem('owlo-lang', lang);
    window.location.reload();
  }
}

export function getLang(): string {
  return _lang;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const keys = key.split('.');
  const tree = (catalog[_lang] ?? en) as unknown as TranslationTree;
  let value = resolve(tree, keys);

  // fallback to English
  if (value === undefined) {
    value = resolve(en as unknown as TranslationTree, keys);
  }

  if (value === undefined) return key;

  if (vars) {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  }

  return value;
}

export const availableLanguages: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' }
];
