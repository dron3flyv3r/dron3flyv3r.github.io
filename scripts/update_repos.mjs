#!/usr/bin/env node
/**
 * Fetch public repos for user and write a trimmed static JSON file.
 * - Filters out forks
 * - Keeps repos with (or without) description (frontend still handles fallback text)
 * - Select fields only
 * - Sorted by updated_at desc
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const USER = 'dron3flyv3r';
const OUTPUT = path.resolve(process.cwd(), 'public', 'repos.json');

async function fetchAllRepos(user) {
  const perPage = 100; // max
  let page = 1;
  let all = [];
  while (true) {
    const url = `https://api.github.com/users/${user}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': `${user}-static-repo-fetch`
      }
    });
    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status} ${res.statusText}`);
    }
    const batch = await res.json();
    all = all.concat(batch);
    if (batch.length < perPage) break; // no more pages
    page += 1;
  }
  return all;
}

function transform(repos) {
  return repos
    .filter(r => !r.fork)
    .map(r => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      id: r.id,
      language: r.language,
      stars: r.stargazers_count,
      updated_at: r.updated_at
    }))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

(async () => {
  try {
    const raw = await fetchAllRepos(USER);
    const data = transform(raw);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2) + '\n');
    console.log(`Wrote ${data.length} repos to ${OUTPUT}`);
  } catch (err) {
    console.error('Failed to update repos.json:', err);
    process.exit(1);
  }
})();
