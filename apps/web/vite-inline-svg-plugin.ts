import { readFileSync } from 'fs';
import { optimize } from 'svgo';
import svgToMiniDataURI from 'mini-svg-data-uri';
import sizeOf from 'image-size';

export default function inlineSvgPlugin() {
  return {
    name: 'inline-svg',
    transform(code: string, id: string) {
      if (!id.endsWith('.svg')) return null;

      const svg = readFileSync(id, 'utf-8');
      const optimized = optimize(svg, {
        plugins: ['preset-default'],
      });

      const src = svgToMiniDataURI(optimized.data);
      const dimensions = sizeOf(Buffer.from(svg));

      const result = {
        src,
        width: dimensions.width,
        height: dimensions.height,
      };

      return {
        code: `export default ${JSON.stringify(result)}`,
        map: null,
      };
    },
  };
}
