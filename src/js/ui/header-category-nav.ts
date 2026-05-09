import {
  categoryTranslationKeys,
  toolTranslationKeys,
} from '../config/i18n-tool-maps.js';

export type HeaderNavCategory = {
  name: string;
  tools: Array<{
    id: string;
    name: string;
    href?: string;
    icon: string;
    subtitle?: string;
  }>;
};

export type MountHeaderCategoryNavOptions = {
  filteredCategories: HeaderNavCategory[];
  t: (key: string) => string;
  allowedToolIds?: Set<string> | null;
};

/** Optional allowlist: when set, only those tool ids are links; others are inert labels. */
export function mountHeaderCategoryNav(
  options: MountHeaderCategoryNavOptions
): void {
  const { filteredCategories, t, allowedToolIds } = options;

  const headerNav = document.getElementById('mypdf-header-category-nav');
  if (!headerNav || filteredCategories.length === 0) return;

  const prefersCoarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none)').matches;

  headerNav.textContent = '';

  const closeAll = () => {
    headerNav
      .querySelectorAll('.mypdf-header-nav-dropdown.is-open')
      .forEach((el) => {
        el.classList.remove('is-open');
        const btn = el.querySelector('.mypdf-header-nav-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
  };

  const navigable = (toolId: string) => {
    if (allowedToolIds == null) return true;
    return allowedToolIds.has(toolId);
  };

  filteredCategories.forEach((category) => {
    const wrap = document.createElement('div');
    wrap.className = 'mypdf-header-nav-dropdown';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'mypdf-header-nav-trigger';
    const catKey = categoryTranslationKeys[category.name];
    trigger.textContent = catKey ? t(catKey) : category.name;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'true');

    const panel = document.createElement('div');
    panel.className = 'mypdf-header-nav-panel';
    panel.setAttribute('role', 'menu');

    category.tools.forEach((tool) => {
      if (!tool.href) return;
      const tk = toolTranslationKeys[tool.name];
      const label = tk ? t(`${tk}.name`) : tool.name;

      if (navigable(tool.id)) {
        const link = document.createElement('a');
        link.href = tool.href;
        link.className = 'mypdf-header-nav-link';
        link.setAttribute('role', 'menuitem');
        link.textContent = label;
        panel.appendChild(link);
      } else {
        const span = document.createElement('span');
        span.className =
          'mypdf-header-nav-link mypdf-header-nav-link--disabled block cursor-not-allowed opacity-45 select-none';
        span.setAttribute('aria-disabled', 'true');
        span.textContent = label;
        panel.appendChild(span);
      }
    });

    if (prefersCoarsePointer) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasOpen = wrap.classList.contains('is-open');
        closeAll();
        if (!wasOpen) {
          wrap.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      panel.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('a')) closeAll();
      });
    }

    wrap.append(trigger, panel);
    headerNav.appendChild(wrap);
  });

  if (prefersCoarsePointer) {
    document.addEventListener('click', (e) => {
      if (!headerNav.contains(e.target as Node)) closeAll();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  headerNav.classList.add('is-mounted');
}
