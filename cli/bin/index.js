#!/usr/bin/env node

import { FakeOmnibox } from "../src/fake_omnibox.js";
import { start } from "querylib/index.js";
import * as readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout
});

const omnibox = new FakeOmnibox();
await start(omnibox);

rl.prompt();

rl.on("line", (line) => {
  omnibox.inputChangeEventEmitter.emit("change", line.trim(), rl);
}).on('close', () => {
  process.exit(0);
});

