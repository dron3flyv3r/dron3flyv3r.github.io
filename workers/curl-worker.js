/**
 * Cloudflare Worker to serve a raw text profile for curl requests.
 * 
 * INSTRUCTIONS:
 * 1. Go to Cloudflare Dashboard > Workers & Pages > Create Application > Create Worker.
 * 2. Name it 'portfolio-curl' (or similar).
 * 3. Click 'Deploy'.
 * 4. Click 'Edit code'.
 * 5. Paste this entire file content into the editor (replace existing code).
 * 6. Click 'Deploy' again.
 * 7. Go to your domain (kasperlarsen.tech) in Cloudflare > Workers Routes.
 * 8. Add route: `kasperlarsen.tech/*` -> Service: `portfolio-curl`.
 */

export default {
    async fetch(request, env, ctx) {
        const userAgent = request.headers.get('User-Agent') || '';
        const url = new URL(request.url);

        // Check if the request is from curl
        if (userAgent.toLowerCase().includes('curl')) {
            // Fetch the raw text file from your static site
            // Ensure this URL points to where your curl.txt is hosted
            const curlUrl = `${url.origin}/curl.txt`;

            const response = await fetch(curlUrl);

            if (response.ok) {
                const text = await response.text();
                return new Response(text, {
                    headers: {
                        'content-type': 'text/plain; charset=utf-8',
                        // Add cache control to prevent stale content
                        'cache-control': 'public, max-age=60',
                    },
                });
            }
        }

        // If not curl, or if fetch failed, pass the request through to the website
        return fetch(request);
    },
};
