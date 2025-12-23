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
const FEATURED_INPUT = path.resolve(process.cwd(), 'data', 'featured.json');
const FEATURED_OUTPUT = path.resolve(process.cwd(), 'public', 'featured.json');
const IGNORED_REPOS = ['dron3flyv3r.github.io', 'storage', 'dron3flyv3r', 'SDU*']; // add repo names here to ignore them

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

function trimRepo(repo) {
  return {
    name: repo.name,
    description: repo.description,
    html_url: repo.html_url,
    id: repo.id,
    language: repo.language,
    stars: repo.stargazers_count,
    updated_at: repo.updated_at,
    homepage: repo.homepage && repo.homepage.trim().length > 0 ? repo.homepage.trim() : null
  };
}

function transform(repos) {
  const isIgnored = (name, ignored) => {
    if (ignored.endsWith('*')) {
      const prefix = ignored.slice(0, -1);
      return name.startsWith(prefix);
    }
    return name === ignored;
  };
  return repos
    .filter(r => !r.fork && !IGNORED_REPOS.some(ignored => isIgnored(r.name, ignored)))
    .map(trimRepo)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

function loadFeaturedConfig() {
  if (!fs.existsSync(FEATURED_INPUT)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(FEATURED_INPUT, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    console.warn(`Expected array in ${FEATURED_INPUT}, got ${typeof data}.`);
  } catch (err) {
    console.warn(`Failed to read ${FEATURED_INPUT}:`, err);
  }
  return [];
}

function buildFeaturedRepos(rawRepos, featuredConfig) {
  const repoMap = new Map(rawRepos.map(repo => [repo.name, repo]));
  const featured = [];
  const toPriority = (value) => {
    if (value === null || value === undefined) return Number.POSITIVE_INFINITY;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
  };

  featuredConfig.forEach((entry) => {
    if (!entry || typeof entry.name !== 'string') {
      return;
    }
    const repo = repoMap.get(entry.name);
    if (!repo) {
      console.warn(`Featured repo not found in GitHub data: ${entry.name}`);
      return;
    }
    featured.push({
      ...trimRepo(repo),
      blurb: entry.blurb ?? null,
      highlight: entry.highlight ?? null,
      priority: entry.priority ?? null
    });
  });

  return featured.sort((a, b) => {
    const aPriority = toPriority(a.priority);
    const bPriority = toPriority(b.priority);
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });
}

(async () => {
  try {
    const raw = await fetchAllRepos(USER);
    const data = transform(raw);
    const featuredConfig = loadFeaturedConfig();
    const featuredData = buildFeaturedRepos(raw, featuredConfig);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2) + '\n');
    fs.writeFileSync(FEATURED_OUTPUT, JSON.stringify(featuredData, null, 2) + '\n');
    console.log(`Wrote ${data.length} repos to ${OUTPUT}`);
    console.log(`Wrote ${featuredData.length} featured repos to ${FEATURED_OUTPUT}`);
  } catch (err) {
    console.error('Failed to update repos.json:', err);
    process.exit(1);
  }
})();
