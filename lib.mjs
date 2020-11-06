import fetch from 'node-fetch';

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

export function updateLine(progressText){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progressText);
}
export function printLine(text){
    console.log(text);
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


