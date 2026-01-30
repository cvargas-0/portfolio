import { ui, defaultLang } from './ui';

export type Lang = keyof typeof ui;

export function isLang(value: string): value is Lang {
  return value in ui;
}

export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split('/');
  if (maybeLang && isLang(maybeLang)) return maybeLang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname.replace(/\/$/, '');
  const segments = pathname.split('/').filter(Boolean);

  const lang = getLangFromUrl(url);

  if (segments[0] === lang) {
    segments.shift();
  }

  return segments.join('/');
}

export function localizePath(lang: Lang, route?: string): string {
  const normalizedRoute = (route ?? '').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!normalizedRoute) return `/${lang}`;
  return `/${lang}/${normalizedRoute}`;
}

export function stripLangFromSlug(slug: string, lang: Lang): string {
  const parts = slug.split('/').filter(Boolean);
  if (parts[0] === lang) return parts.slice(1).join('/');
  return slug;
}
