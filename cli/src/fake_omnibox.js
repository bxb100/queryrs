import { Omnibox } from "omnibox-js";
import { EventEmitter } from "events";
import * as fs from "node:fs";
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os'

export class FakeOmnibox extends Omnibox {

  constructor() {
    super({
      render: null, hint: false
    });
  }

  inputChangeEventEmitter = new EventEmitter();

  bootstrap() {
    this.inputChangeEventEmitter.on("change", async (input, inter) => {
      let searchResult = await this.performSearch(input);
      let results = searchResult.result;
      let res = await Promise.all(results
        .filter(({ content }) => {
          if (content) {
            return !content.startsWith("tips1")
          }
          return true;
        })
        .map(async ({ event, ...item }, index) => {
          if (event) {
            item = await event.format(item, index);
            item.description = parseOmniboxDescription(item.description);
          }
          return item;
        }));

      let folder = await mkdtemp(join(tmpdir(), 'queryrs-'));
      let file = join(folder, "query.json");
      fs.writeFileSync(file, JSON.stringify(res))
      console.log(file);
      inter.prompt();
    });
  }
}

function parseOmniboxDescription(input) {
  return input.replaceAll("<match>", "")
    .replaceAll("</match>", "")
    .replaceAll("<dim>", "")
    .replaceAll("</dim>", "")
    .replaceAll("<span>", "")
    .replaceAll("</span>", "");
}
