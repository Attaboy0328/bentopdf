const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function initPageMotion(): void {
  if (typeof window === 'undefined') return;

  if (window.matchMedia(REDUCED_MOTION).matches) {
    document.documentElement.dataset.pageReady = 'true';
    return;
  }

  document.documentElement.classList.add('mypdf-motion-safe');
}

/** Attach reveal target to main page regions (home #app, tool #uploader, etc.). */
export function markRevealRoots(): void {
  const app = document.getElementById('app');
  if (app) app.classList.add('mypdf-reveal-root');

  const uploader = document.getElementById('uploader');
  if (uploader) uploader.classList.add('mypdf-reveal-root');

  const main = document.querySelector('main');
  if (main && !app && !uploader) {
    main.classList.add('mypdf-reveal-root');
  }
}

export type RevealPageOptions = {
  /** Stagger homepage tool category blocks after the grid is built. */
  staggerCategories?: boolean;
};

/**
 * Run after i18n, DOM, and icons are ready so content fades in once — no hard pop-in.
 */
export function revealPage(options: RevealPageOptions = {}): void {
  const root = document.documentElement;

  if (window.matchMedia(REDUCED_MOTION).matches) {
    root.dataset.pageReady = 'true';
    return;
  }

  if (options.staggerCategories) {
    document
      .querySelectorAll('#tool-grid .category-group')
      .forEach((group, index) => {
        group.classList.add('mypdf-reveal-stagger');
        (group as HTMLElement).style.setProperty(
          '--mypdf-stagger',
          String(0.14 + index * 0.045)
        );
      });
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.dataset.pageReady = 'true';
    });
  });
}
