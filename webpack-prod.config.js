
// prod config
const stripLoader = require('strip-loader');
const devConfig = require('./webpack-dev.config');

const jsLoader = {
  test: [/\.js$/],
  exclude: /node_modules/,
  loader: stripLoader.loader('console.log')
};

devConfig.module.loaders.push(jsLoader);
devConfig.output.filename = '../dist/reactive-ajax.min.js';

module.exports = devConfig;
