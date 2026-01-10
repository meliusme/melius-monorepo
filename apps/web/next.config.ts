import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n.ts',
  experimental: {
    createMessagesDeclaration: './src/messages/en.json',
  },
});

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
