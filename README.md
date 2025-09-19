# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
Currently, two official plugins are available:
## Static GitHub Repos Data

This project uses a pre-generated `public/repos.json` instead of fetching the GitHub API on every page load.

- Generation script: `scripts/update_repos.mjs`
- GitHub Action: `.github/workflows/update-repos.yml` (runs monthly on the 1st at 00:00 UTC)
- Manual update: `npm run update:repos`
- Frontend fetches: `https://raw.githubusercontent.com/dron3flyv3r/dron3flyv3r.github.io/main/public/repos.json` with fallback to `/repos.json`.

### Schema
```json
{
  "name": "repo-name",
  "description": "Optional description",
  "html_url": "https://github.com/...",
  "id": 123456789,
  "language": "TypeScript",
  "stars": 42,
  "updated_at": "2025-09-01T12:34:56Z"
}
```

### Manual Refresh Flow
```
npm run update:repos
git add public/repos.json
git commit -m "chore: manual repos.json refresh"
git push
```

### Benefits
- Removes per-visit GitHub API calls
- Avoids rate limiting for anonymous users
- Faster initial load and deterministic content
- Simplifies client logic (uses long-lived cache with 24h invalidation)


- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
