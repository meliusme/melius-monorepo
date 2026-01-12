const fs = require('fs');
const path = require('path');

const errorCodes = require('./error-codes.json');

const backendPath = path.join(
  __dirname,
  '../../apps/backend/src/common/errors/error-codes.generated.ts',
);
const webPath = path.join(
  __dirname,
  '../../apps/web/src/generated/error-codes.generated.ts',
);

const entries = Object.entries(errorCodes)
  .map(([key, value]) => `  ${key} = '${value}',`)
  .join('\n');

const content = `// This file is auto-generated from packages/error-codes/error-codes.json
// Do not edit manually. Run: pnpm generate:error-codes

export enum ErrorCode {
${entries}
}
`;

fs.mkdirSync(path.dirname(backendPath), { recursive: true });
fs.mkdirSync(path.dirname(webPath), { recursive: true });

fs.writeFileSync(backendPath, content);
fs.writeFileSync(webPath, content);

console.log('✅ Generated error codes:');
console.log('  - apps/backend/src/common/errors/error-codes.generated.ts');
console.log('  - apps/web/src/generated/error-codes.generated.ts');

// Format with Prettier
const { execSync } = require('child_process');
const rootDir = path.join(__dirname, '../..');
try {
  execSync(`pnpm -C apps/backend exec prettier --write "${backendPath}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });
  execSync(`pnpm -C apps/web exec prettier --write "${webPath}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });
  console.log('✅ Formatted with Prettier');
} catch (error) {
  console.warn('⚠️ Prettier formatting failed, but files were generated');
}
