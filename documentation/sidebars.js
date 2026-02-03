/**
 * Creating a sidebar enables you to:
 - create an organized menu of your docs
 - display the current doc within a navigation menu
 - provide the next/previous doc in the series
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/prerequisites',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Installation',
      collapsed: false,
      items: [
        'installation/install-npm',
        'installation/configure-monorepo',
        'installation/first-run',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'features/package-scanning',
        'features/health-monitoring',
        'features/dependency-analysis',
        'features/git-integration',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api-reference/overview',
        'api-reference/packages',
        'api-reference/health',
        'api-reference/commits',
        'api-reference/config',
      ],
    },
    {
      type: 'category',
      label: 'Upcoming Features',
      collapsed: true,
      items: [
        'upcoming-features/CICD',
        'upcoming-features/version-control',
      ],
    },
  ],
};

module.exports = sidebars;
