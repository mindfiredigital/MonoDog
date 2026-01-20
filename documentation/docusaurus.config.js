// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Monodog',
  tagline: 'Monorepo Analytics and Health Dashboard API',
  favicon: 'img/favicon.ico',

  url: 'https://mindfiredigital.github.io',
  baseUrl: '/monodog',

  organizationName: 'mindfiredigital',
  projectName: 'monodog',
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
          editUrl: 'https://github.com/mindfiredigital/monodog/tree/main/docs',
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
      title: 'Monodog',
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
          href: 'https://github.com/mindfiredigital/monodog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    // footer: {
    //   style: 'dark',
    //   links: [
    //     {
    //       title: 'Docs',
    //       items: [
    //         {
    //           label: 'Getting Started',
    //           to: '/getting-started/overview',
    //         },
    //         {
    //           label: 'Installation',
    //           to: '/installation/install-npm',
    //         },
    //         {
    //           label: 'API Reference',
    //           to: '/api-reference/overview',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Community',
    //       items: [
    //         {
    //           label: 'GitHub Discussions',
    //           href: 'https://github.com/monodog/monoapp/discussions',
    //         },
    //         {
    //           label: 'GitHub Issues',
    //           href: 'https://github.com/monodog/monoapp/issues',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Resources',
    //       items: [
    //         {
    //           label: 'GitHub Repository',
    //           href: 'https://github.com/monodog/monoapp',
    //         },
    //         {
    //           label: 'NPM Package',
    //           href: 'https://www.npmjs.com/package/@monodog/monoapp',
    //         },
    //       ],
    //     },
    //   ],
    //   copyright: `Copyright © ${new Date().getFullYear()} Monodog. Built with Docusaurus.`,
    // },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
    },
  },
};

module.exports = config;
