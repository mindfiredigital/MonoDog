// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MonoDog',
  tagline: 'Monorepo Analytics and Health Dashboard API',
  favicon: 'img/favicon.ico',

  url: 'https://mindfiredigital.github.io',
  baseUrl: '/MonoDog',

  organizationName: 'mindfiredigital',
  projectName: 'MonoDog',
  deploymentBranch: 'main',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          editUrl: 'https://github.com/mindfiredigital/MonoDog/tree/main/documentation',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    // image: 'img/monoapp-social-card.jpg',
    navbar: {
      title: 'MonoDog',
      logo: {
        alt: 'Monodog Logo',
        src: 'img/logo.jpg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/mindfiredigital/MonoDog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
    },
  },
};

module.exports = config;
