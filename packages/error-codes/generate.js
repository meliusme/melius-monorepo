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
  .map(([key, value]) => `  ${key} = '${value}'`)
  .join(',\n');

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
