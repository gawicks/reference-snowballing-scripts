import { printMessage, writeJSON } from "./lib.mjs";
import fuseIndex from "../out/fuse-index.json";
import papers from "../out/papers-meta.json";
import Fuse from "fuse.js";

const myIndex = Fuse.parseIndex(fuseIndex);
const options = {
  includeScore: true,
  shouldSort: true,
  ignoreLocation: true,
  includeMatches: true,
  keys: ["title", "abstract"],
};

const fuse = new Fuse(papers, options, myIndex);
const searchStr = process.argv[2];
let results = [];
const output = [];

if (searchStr) {
  printMessage(`Fuzzy search on '${searchStr}'`);
  results = fuse.search(searchStr);
} else {
  printMessage(`Missing search string`);
}

results.forEach((result) => {
  const threshold = 0.8;
  if (result.score < threshold) {
    output.push({
      title: result.item.title,
      abstract: result.item.abstract,
      score: result.score,
    });
  }
});
printMessage(`${output.length} results found`);
await writeJSON(output, "out/search-result.json");
