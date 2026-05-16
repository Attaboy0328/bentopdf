/**
 * Minimal shell for tool pages that use navbar-simple (theme, i18n, header category nav).
 * Used by pdf-workflow.html instead of full main.ts.
 */
import '../css/styles.css';
import { categories } from './config/tools.js';
import { loadRuntimeConfig, isToolDisabled } from './utils/disabled-tools.js';
import {
  initI18n,
  applyTranslations,
  injectLanguageSwitcher,
  rewriteLinks,
  t,
} from './i18n/index.js';
import { initThemeToggle } from './theme.js';
import { mountHeaderCategoryNav } from './ui/header-category-nav.js';
import {
  initPageMotion,
  markRevealRoots,
  revealPage,
} from './ui/page-reveal.js';

async function init(): Promise<void> {
  initPageMotion();
  markRevealRoots();

  await initI18n();
  await loadRuntimeConfig();
  initThemeToggle();
  injectLanguageSwitcher();
  applyTranslations();

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      tools: category.tools.filter((tool) => !isToolDisabled(tool.id)),
    }))
    .filter((category) => category.tools.length > 0);

  mountHeaderCategoryNav({
    filteredCategories,
    t,
  });

  rewriteLinks();
  revealPage();
}

void init();
