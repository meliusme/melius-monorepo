import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

const OPENAPI_URL = process.env.OPENAPI_URL || 'http://localhost:3000/api-json';
const OUTPUT_PATH = process.env.OPENAPI_YAML_PATH || 'openapi.yaml';

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(`Failed to fetch ${url} (status ${res.statusCode})`),
          );
          res.resume();
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const needsQuotes = (value) => {
  if (value === '') return true;
  if (/[\n\r]/.test(value)) return true;
  if (/^\s|\s$/.test(value)) return true;
  if (/[:#\-[\]{}&,*!|>'"%@`]/.test(value)) return true;
  if (/^(true|false|null|~|[-+]?\d+(\.\d+)?)(\s|$)/i.test(value))
    return true;
  return false;
};

const formatScalar = (value) => {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (typeof value === 'string') {
    return needsQuotes(value) ? JSON.stringify(value) : value;
  }
  return JSON.stringify(value);
};

const formatKey = (key) => {
  return needsQuotes(key) ? JSON.stringify(key) : key;
};

const toYaml = (value, indent = 0) => {
  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]`;
    return value
      .map((item) => {
        if (isPlainObject(item) || Array.isArray(item)) {
          return `${pad}-\n${toYaml(item, indent + 1)}`;
        }
        return `${pad}- ${formatScalar(item)}`;
      })
      .join('\n');
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return `${pad}{}`;
    return keys
      .map((key) => {
        const val = value[key];
        if (isPlainObject(val) || Array.isArray(val)) {
          return `${pad}${formatKey(key)}:\n${toYaml(val, indent + 1)}`;
        }
        return `${pad}${formatKey(key)}: ${formatScalar(val)}`;
      })
      .join('\n');
  }

  return `${pad}${formatScalar(value)}`;
};

const main = async () => {
  const json = await fetchJson(OPENAPI_URL);
  const yaml = toYaml(json);
  fs.writeFileSync(OUTPUT_PATH, `${yaml}\n`, 'utf8');
  console.log(`OpenAPI YAML written to ${OUTPUT_PATH}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
