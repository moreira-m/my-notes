// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Meus Cadernos',
  tagline: 'Documentação de estudos digitalizada',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',

  customFields: {
    apiUrl: process.env.API_URL || 'http://localhost:3333',
  },

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        // Blog desativado — o foco é documentação + digitalização
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Meus Cadernos',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentação',
          },
          {
            to: '/',
            label: 'Digitalizar',
            position: 'left',
            activeBaseRegex: '^/$',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Navegação',
            items: [
              {
                label: 'Documentação',
                to: '/docs/intro',
              },
              {
                label: 'Digitalizar',
                to: '/',
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Meus Cadernos. Feito com Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
