import { promises as fs } from 'fs';
import { buildIndex } from './lib.mjs';
import { updateMessage, printMessage, deduplicate } from './lib.mjs';
import { search, get } from './lib.mjs';
import eachLimit from 'async/eachLimit.js';
import { difference } from './lib.mjs';

const max_concurrency = 3;
const includesData = await fs.readFile('./includes.txt', 'utf-8');
const excludesData = await fs.readFile('./excludes.txt', 'utf-8');
const includesTitles = includesData.split(/\r?\n/).filter(title => title.trim());
const excludesTitles = excludesData.split(/\r?\n/).filter(title => title.trim());
let snowball = [];
const includes = [];
const excludes = [];
const references = [];

await processIncludes();
await processExcludes();
await doSnowball(includes);
await trimSnowball([...includes, ...excludes]);
await buildSearchIndex(snowball);


async function processIncludes() {
    let progress = 0;
    await eachLimit(includesTitles, max_concurrency, async(paperTitle) => {
        const result = await search(paperTitle);
        updateMessage(`Processed ${++progress} of ${includesTitles.length} includes`);
        includes.push(result.id);
        references[result.id] = result.references;
    })
}

async function processExcludes() {
    let progress = 0;
    await eachLimit(excludesTitles, max_concurrency, async(paperTitle) => {
        const result = await search(paperTitle);
        updateMessage(`Processed ${++progress} of ${excludesTitles.length} excludes`);
        excludes.push(result.id);
    })
}

function doSnowball(papers) {
    papers.forEach(paper => snowball.push(...references[paper]));
    printMessage(`${snowball.length} all papers found`);
}

function trimSnowball(trimIDs) {
    snowball = difference(snowball, trimIDs);
    snowball = deduplicate(snowball);
    printMessage(`${snowball.length} unique papers found`);
}

async function buildSearchIndex(papers) {
    let index = [];
    let progress = 0;
    await eachLimit(papers, max_concurrency, async(paper) => {
        const result = await get(paper);
        updateMessage(`Indexing ${++progress} of ${snowball.length} papers`);
        index.push({ id: result.id, title: result.title, abstract: result.abstract });
    });
    buildIndex(index);
    printMessage(`Search index built`);
}








