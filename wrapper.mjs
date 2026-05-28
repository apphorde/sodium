import { readFile } from "node:fs/promises";

async function main() {
  const [inputFile] = process.argv.slice(2);
  const html = await readFile(inputFile, "utf-8");

  console.log(`import { defineFromString } from "@li3/web";
(async function(){const r = await (await fetch(import.meta.url)).text();defineFromString(r.slice(r.indexOf('/***'), -4));})();
/***
${html}
***/`);
}

main();
