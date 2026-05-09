import { createIcons, icons } from 'lucide';

const STORAGE_KEY = 'mypdf-theme';

export type MypdfTheme = 'dark' | 'light';

export function getTheme(): MypdfTheme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: MypdfTheme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  syncThemeColorMeta();
  updateThemeToggleIcons();
  document.dispatchEvent(
    new CustomEvent('mypdf-theme-change', { detail: { theme } })
  );
}

function syncThemeColorMeta(): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute(
    'content',
    getTheme() === 'dark' ? '#0b1220' : '#f9f8f6'
  );
}

function updateThemeToggleIcons(): void {
  const btn = document.getElementById('mypdf-theme-toggle');
  if (!btn) return;
  const isDark = getTheme() === 'dark';
  const sun = btn.querySelector('[data-mypdf-theme-icon="sun"]');
  const moon = btn.querySelector('[data-mypdf-theme-icon="moon"]');
  sun?.classList.toggle('hidden', !isDark);
  moon?.classList.toggle('hidden', isDark);
  btn.setAttribute(
    'aria-label',
    isDark ? 'Switch to light theme' : 'Switch to dark theme'
  );
}

/** Call after DOM for index / pages that include the toggle. */
export function initThemeToggle(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    } else {
      document.documentElement.dataset.theme = 'dark';
    }
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }

  syncThemeColorMeta();

  const btn = document.getElementById('mypdf-theme-toggle');
  btn?.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    createIcons({ icons });
  });

  updateThemeToggleIcons();
  createIcons({ icons });
}
