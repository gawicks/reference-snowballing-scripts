import { promises as fs } from 'fs';
import { updateLine, printLine } from './lib.mjs';
import { search, get } from './lib.mjs';

const dataFile = await fs.readFile('./papers.txt', 'utf-8');
const referenceArr = [];
const papers = dataFile.split(/\r?\n/).filter(paper => paper.trim());
let progress = 0;
let handles = papers.map(async(paper) => {
    const result = await search(paper);
    updateLine(`Processed ${++progress} of ${papers.length}`);
    referenceArr.push(...result.references);
});
await Promise.all(handles);

printLine(`${referenceArr.length} all references found`);

let deDup = [...new Set(referenceArr)];
console.log(deDup);

printLine(`1st pass ${deDup.length} unique references found`);

progress = 0;
handles = deDup.map(async(paper) => {
    const result = await get(paper);
    updateLine(`Processed ${++progress} of ${deDup.length}`);
    referenceArr.push(...result.references);
});

await Promise.all(handles);

deDup = [...new Set(referenceArr)];

console.log(deDup);

printLine(`2nd pass ${deDup.length} unique references found `);



