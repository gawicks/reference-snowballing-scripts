import fetch from 'node-fetch';
import Fuse from 'fuse.js'
import { promises as fs } from 'fs';
import beautify from 'json-beautify';

const msAcademicBaseURL = 'https://academic.microsoft.com/api';
const msAcademicSearchURL = `${msAcademicBaseURL}/search`;

export async function search(title) {
    const query = buildQuery(title);
    const body = JSON.stringify(query);
    const response = await fetch(msAcademicSearchURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body
    });
    return buildAPIResponse(await response.json());
}

export async function get(id) {
    const query = buildQuery(undefined, `Id=${id}`);
    const body = JSON.stringify(query);
    const response = await fetch(msAcademicSearchURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body
    });
    return buildAPIResponse(await response.json());
}

export function updateMessage(message){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(message);
}
export function printMessage(message){
    console.log(`\n${message}`);
}
export async function writeJSON(obj){
    const out = beautify(obj, null, 2, 100);
    await fs.writeFile('result.json', out);
}
export function buildIndex(list) {
    const index = Fuse.createIndex(['title', 'abstract'], list);
    fs.writeFile('fuse-index.json', JSON.stringify(index.toJSON()));
    fs.writeFile('papers-meta.json', JSON.stringify(list));
}
export function deduplicate(arr) {
    let deDup = [...new Set(arr)];
    return deDup;
}
export function difference(arr, arrToRemove) {
    return arr.filter(item => !arrToRemove.includes(item));
}

function buildQuery(query = "", queryExpression = "", limit = 1) {
    return {
        query,
        queryExpression,
        filters: [],
        take: limit
    }
}

function buildAPIResponse(response) {
    const paper = response.pr[0].paper;
    return {
        id: paper.id,
        title: paper.dn,
        abstract: paper.d,
        references: paper.r
    }
}


