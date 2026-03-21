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
    accessPassword: process.env.ACCESS_PASSWORD || '1234', // '1234' é um padrão de desenvolvimento local
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
          routeBasePath: '/',
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
            to: '/digitalizar',
            label: 'Digitalizar',
            position: 'left',
            activeBaseRegex: '^/digitalizar',
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
                to: '/',
              },
              {
                label: 'Digitalizar',
                to: '/digitalizar',
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
