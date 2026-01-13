import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  stories: 'src/**/*.stories.{tsx,jsx}',
  viteConfig: path.resolve(__dirname, '../vite.config.ts'),
};
