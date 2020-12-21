'use strict';
const { relative } = require('path');
const { readFile, writeFile } = require('fs').promises;
const entries = require('../packages/core-js-compat/entries');

const core = Object.keys(entries).reduce((accumulator, it) => {
  const entry = it.replace(/^core-js(\/)?/, './');
  if (entry.startsWith('./modules/')) return accumulator;
  const path = `./${ relative('./packages/core-js', require.resolve(`../packages/${ it }`)).replace(/\\/g, '/') }`;
  accumulator[entry] = path;
  return accumulator;
}, {
  './package': './package.json',
  './configurator': './configurator.js',
  './modules/*': './modules/*.js',
});

async function writeExportsField(path, exports) {
  const pkg = JSON.parse(await readFile(path, 'utf8'));
  pkg.exports = exports;
  await writeFile(path, `${ JSON.stringify(pkg, null, '  ') }\n`);
}

(async function () {
  await writeExportsField('./packages/core-js/package.json', core);
  await writeExportsField('./packages/core-js-pure/package.json', core);
  // eslint-disable-next-line no-console
  console.log('\u001B[32m`exports` fields updated\u001B[0m');
})();
