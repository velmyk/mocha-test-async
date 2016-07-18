'use strict';

const
    glob = require('glob'),
    path = require('path');

module.exports = (sourceDir) => {
    require('./testConfig');
    require('babel-polyfill');

    const SPECS_PATTERN = path.join(sourceDir, '/**/*.spec.js');

    glob.sync(SPECS_PATTERN).forEach(spec => require(spec));
};
