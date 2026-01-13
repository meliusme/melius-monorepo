import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n.ts',
  experimental: {
    createMessagesDeclaration: './src/messages/en.json',
  },
});

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ['./src'],
    additionalData: `@use "@/styles/variables.scss" as *; @use "@/styles/mixins.scss" as *;`,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['turbopack-inline-svg-loader'],
        as: '*.js',
      },
    },
  },
};

export default withNextIntl(nextConfig);
