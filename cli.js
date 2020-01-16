#!/usr/bin/env node

const argv = require("minimist")(process.argv.slice(2));
const timelapse = require("./index");

timelapse(argv.g, argv.p);
