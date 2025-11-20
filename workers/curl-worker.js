/**
 * Cloudflare Worker to serve a raw text profile for curl requests.
 */

const PROFILE_TEXT = `
   __ __                             
  / //_/__ ____dron3flyv3r____ ____ 
 / ,< / _ \`(_-< _ \\/ -_) __/ // /
/_/|_|\\_,_/___/ .__/\\__/_/  \\_, / 
             /_/           /___/  

> Kasper Larsen
> Robotic Engineering Student | Backend & AI Systems

----------------------------------------
[ ABOUT ]
I build intelligent systems that think, learn, and adapt.
Focusing on the intersection of robotics, AI, and backend infrastructure.

[ SKILLS ]
Languages:  Python, C++, SQL, TypeScript, Bash
AI/ML:      PyTorch, RL, NLP, Computer Vision
Tools:      Linux, Docker, Git, MySQL

[ PROJECTS ]
* SOPA: Smart Operational Personal Assistant (AI/NLU)
* dron3flyv3r.github.io: This portfolio (React + Vite)
... and many more on GitHub.

[ CONTACT ]
Email:    contact@kasperlarsen.tech
GitHub:   https://github.com/dron3flyv3r
LinkedIn: https://www.linkedin.com/in/kasper-horn-larsen-9146a4238/
Web:      https://kasperlarsen.tech

----------------------------------------
Run 'curl -L kasperlarsen.tech/card' for this card.
`;

export default {
    async fetch(request, env, ctx) {
        const userAgent = request.headers.get('User-Agent') || '';

        // Check if the request is from curl
        if (userAgent.toLowerCase().includes('curl')) {
            return new Response(PROFILE_TEXT, {
                headers: {
                    'content-type': 'text/plain; charset=utf-8',
                    'cache-control': 'public, max-age=60',
                },
            });
        }

        // If not curl, pass the request through to the website
        return fetch(request);
    },
};
