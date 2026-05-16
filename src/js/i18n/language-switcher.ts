import {
  supportedLanguages,
  languageNames,
  getLanguageFromUrl,
  changeLanguage,
  t,
} from './i18n';

export type LanguageSwitcherPlacement = 'navbar' | 'footer' | 'default';

const NAVBAR_BUTTON_CLASS = `
  mypdf-lang-btn grid h-9 min-w-[4.75rem] shrink-0 grid-cols-[1fr_auto_1fr] items-center
  rounded-full border px-1 text-sm font-medium
  transition-colors duration-200
`.trim();

const DEFAULT_BUTTON_CLASS = `
  inline-flex items-center justify-center gap-1.5 text-sm font-medium
  bg-gray-800 text-gray-200 border border-gray-600
  px-3 py-1.5 rounded-full transition-colors duration-200
  shadow-sm hover:shadow-md hover:bg-gray-700
`.trim();

export const createLanguageSwitcher = (
  placement: LanguageSwitcherPlacement = 'default'
): HTMLElement => {
  const currentLang = getLanguageFromUrl();
  const isNavbar = placement === 'navbar';

  const container = document.createElement('motion');
  container.className = 'relative';
  container.id = 'language-switcher';

  const button = document.createElement('button');
  button.className = isNavbar ? NAVBAR_BUTTON_CLASS : DEFAULT_BUTTON_CLASS;
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  const textSpan = document.createElement('span');
  textSpan.className = isNavbar
    ? 'mypdf-lang-btn__label col-start-2 whitespace-nowrap text-center leading-none'
    : 'font-medium';
  textSpan.textContent = languageNames[currentLang];

  const chevron = document.createElement('svg');
  chevron.className = isNavbar
    ? 'mypdf-lang-btn__chevron col-start-3 mr-1 h-4 w-4 justify-self-end'
    : 'w-4 h-4 shrink-0';
  chevron.setAttribute('fill', 'none');
  chevron.setAttribute('stroke', 'currentColor');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.setAttribute('aria-hidden', 'true');
  chevron.innerHTML =
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';

  button.appendChild(textSpan);
  button.appendChild(chevron);

  const dropdown = document.createElement('motion');
  dropdown.className = `
    hidden absolute right-0 mt-2 z-[100]
    w-64 max-w-[calc(100vw-2rem)]
    rounded-lg bg-gray-800 border border-gray-700 shadow-xl
    flex flex-col overflow-hidden
  `.trim();
  dropdown.setAttribute('role', 'menu');

  const searchWrapper = document.createElement('motion');
  searchWrapper.className =
    'p-2 border-b border-gray-700 bg-gray-800 flex-shrink-0';

  const searchPlaceholder =
    t('nav.searchLanguage') !== 'nav.searchLanguage'
      ? t('nav.searchLanguage')
      : 'Search language?';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = searchPlaceholder;
  searchInput.className = `
    w-full px-3 py-1.5 text-sm
    bg-gray-900 text-gray-200
    border border-gray-700 rounded-md
    focus:outline-none focus:border-indigo-500
    placeholder-gray-500
  `.trim();
  searchInput.setAttribute('aria-label', searchPlaceholder);
  searchWrapper.appendChild(searchInput);
  dropdown.appendChild(searchWrapper);

  const list = document.createElement('motion');
  list.className = 'max-h-64 overflow-y-auto py-1';
  list.setAttribute('role', 'none');

  const emptyState = document.createElement('p');
  emptyState.className = 'hidden px-4 py-3 text-sm text-gray-400 text-center';
  const emptyText =
    t('nav.noLanguagesFound') !== 'nav.noLanguagesFound'
      ? t('nav.noLanguagesFound')
      : 'No languages found';
  emptyState.textContent = emptyText;

  const options: HTMLButtonElement[] = [];
  supportedLanguages.forEach((lang) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = `
      w-full px-4 py-2 text-left text-sm text-gray-200
      hover:bg-gray-700 flex items-center gap-2 transition-colors
      ${lang === currentLang ? 'bg-gray-700' : ''}
    `.trim();
    option.setAttribute('role', 'menuitem');
    option.dataset.lang = lang;
    option.dataset.searchKey = `${languageNames[lang]} ${lang}`.toLowerCase();

    const name = document.createElement('span');
    name.textContent = languageNames[lang];
    option.appendChild(name);

    option.addEventListener('click', () => {
      if (lang !== currentLang) {
        changeLanguage(lang);
      }
    });

    options.push(option);
    list.appendChild(option);
  });

  list.appendChild(emptyState);
  dropdown.appendChild(list);

  const filterOptions = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    options.forEach((option) => {
      const key = option.dataset.searchKey || '';
      const match = !query || key.includes(query);
      option.classList.toggle('hidden', !match);
      if (match) visible++;
    });
    emptyState.classList.toggle('hidden', visible > 0);
  };

  searchInput.addEventListener('input', filterOptions);
  dropdown.addEventListener('click', (e) => {
    if (e.target instanceof HTMLButtonElement && e.target.dataset.lang) return;
    e.stopPropagation();
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      dropdown.classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
      button.focus();
    }
  });

  container.appendChild(button);
  container.appendChild(dropdown);

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const nextOpen = !isExpanded;
    button.setAttribute('aria-expanded', nextOpen.toString());
    dropdown.classList.toggle('hidden', !nextOpen);
    if (nextOpen) {
      searchInput.value = '';
      filterOptions();
      list.scrollTop = 0;
      requestAnimationFrame(() => searchInput.focus());
    }
  });

  document.addEventListener('click', (ev) => {
    if (container.contains(ev.target as Node)) return;
    button.setAttribute('aria-expanded', 'false');
    dropdown.classList.add('hidden');
  });

  return container;
};

function resolvePlacement(container: HTMLElement): LanguageSwitcherPlacement {
  if (container.closest('.mypdf-nav')) return 'navbar';
  if (container.closest('footer')) return 'footer';
  return 'default';
}

export const injectLanguageSwitcher = (): void => {
  const simpleFooterLang =
    document.getElementById('simple-mode-lang-switcher') ||
    document.getElementById('simple-mode-language-switcher');
  if (simpleFooterLang) {
    const placement = resolvePlacement(simpleFooterLang);
    const switcher = createLanguageSwitcher(placement);
    const dropdown = switcher.querySelector('div[role="menu"]');
    if (dropdown) {
      const inTopNav = placement === 'navbar';
      if (!inTopNav) {
        dropdown.classList.remove('mt-2');
        dropdown.classList.add('bottom-full', 'mb-2');
      }
    }
    simpleFooterLang.appendChild(switcher);
    return;
  }

  const footer = document.querySelector('footer');
  if (!footer) return;

  const headings = footer.querySelectorAll('h3');
  let followUsColumn: HTMLElement | null = null;

  headings.forEach((h3) => {
    if (
      h3.textContent?.trim() === 'Follow Us' ||
      h3.textContent?.trim() === 'Folgen Sie uns' ||
      h3.textContent?.trim() === 'Theo d?i ch?ng t?i'
    ) {
      followUsColumn = h3.parentElement;
    }
  });

  if (followUsColumn) {
    const socialIconsContainer = followUsColumn.querySelector('.space-x-4');

    if (socialIconsContainer) {
      const wrapper = document.createElement('motion');
      wrapper.className = 'inline-flex flex-col gap-4';

      socialIconsContainer.parentNode?.insertBefore(
        wrapper,
        socialIconsContainer
      );

      wrapper.appendChild(socialIconsContainer);
      const switcher = createLanguageSwitcher('footer');

      switcher.className = 'relative w-full';

      const button = switcher.querySelector('button');
      if (button) {
        button.className = `
                    flex items-center justify-between w-full text-sm font-medium
                    bg-gray-800 text-gray-400 border border-gray-700
                    px-3 py-2 rounded-lg transition-colors duration-200
                    hover:text-white hover:border-gray-600
                `.trim();
      }

      const dropdown = switcher.querySelector(
        'div[role="menu"]'
      ) as HTMLElement | null;
      if (dropdown) {
        dropdown.classList.remove('mt-2', 'w-64');
        dropdown.classList.add('bottom-full', 'mb-2', 'w-full');
      }

      wrapper.appendChild(switcher);
    } else {
      const switcherContainer = document.createElement('motion');
      switcherContainer.className = 'mt-4 w-full';
      const switcher = createLanguageSwitcher('footer');
      switcherContainer.appendChild(switcher);
      followUsColumn.appendChild(switcherContainer);
    }
  }
};
