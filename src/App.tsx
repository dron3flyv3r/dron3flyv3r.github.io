import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Repo } from './types/repo';
import './App.css';

const loadIntentDemo = () => import('./components/IntentDemo');
const IntentDemo = lazy(loadIntentDemo);

const formatUpdatedAt = (iso?: string): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
};

const normalizeHomepageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

function App() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [shouldRenderDemo, setShouldRenderDemo] = useState(false);
  const demoSectionRef = useRef<HTMLElement | null>(null);
  const [liveStatuses, setLiveStatuses] = useState<Record<number, 'checking' | 'up' | 'down'>>({});
  const age = Math.floor((new Date().getTime() - new Date(2003, 6, 18).getTime()) / 3.15576e+10);

  useEffect(() => {
    // fetch('https://raw.githubusercontent.com/dron3flyv3r/dron3flyv3r.github.io/refs/heads/main/public/repos.json')
    fetch('/repos.json')
      .then(res => res.json())
      .then((data: Repo[]) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load repos:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadIntentDemo();
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (shouldRenderDemo) {
      return;
    }

    const ref = demoSectionRef.current;
    if (!ref) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRenderDemo(true);
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [shouldRenderDemo]);

  useEffect(() => {
    if (repos.length === 0) return;

    let isMounted = true;
    const controllers: AbortController[] = [];

    repos.slice(0, 6).forEach((repo) => {
      const homepageUrl = normalizeHomepageUrl(repo.homepage);
      if (!homepageUrl) return;

      setLiveStatuses((prev) => ({
        ...prev,
        [repo.id]: prev[repo.id] ?? 'checking',
      }));

      const controller = new AbortController();
      controllers.push(controller);

      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      fetch(homepageUrl, { method: 'GET' })
        .then((response) => {
          console.log("Pinging", homepageUrl, response);
          
          if (!isMounted) return;
          if (!response || response.type === 'opaque' || response.ok) {
            setLiveStatuses((prev) => ({ ...prev, [repo.id]: 'up' }));
          } else {
            setLiveStatuses((prev) => ({ ...prev, [repo.id]: 'down' }));
          }
        })
        .catch(() => {
          if (isMounted) {
            setLiveStatuses((prev) => ({ ...prev, [repo.id]: 'down' }));
          }
        })
        .finally(() => {
          window.clearTimeout(timeoutId);
        });
    });

    return () => {
      isMounted = false;
      controllers.forEach((controller) => controller.abort());
    };
  }, [repos]);

  const skills = {
    languages: [
      { name: 'Python', level: 'Expert', color: 'var(--accent-python)' },
      { name: 'C++', level: 'Proficient', color: 'var(--accent-cpp)' },
      { name: 'SQL', level: 'Proficient', color: 'var(--accent-sql)' },
      { name: 'JavaScript/TypeScript', level: 'Intermediate', color: 'var(--accent-js)' },
      { name: 'Bash', level: 'Intermediate', color: 'var(--accent-bash)' },
      { name: 'HTML/CSS', level: 'Knowledgeable', color: 'var(--accent-html)' },
    ],
    tools: [
      { name: 'Linux', icon: '🐧', color: '#f0f0f0' },
      { name: 'Git', icon: '🔧', color: '#f0f0f0' },
      { name: 'MySQL', icon: '🐬', color: '#336791' },
      { name: 'Docker', icon: '🐳', color: 'var(--accent-docker)' },
      { name: 'docker-compose', icon: '🏗️', color: 'var(--accent-docker)' },
    ],
    ai: [
      { name: 'PyTorch', icon: '🔥' },
      { name: 'Reinforcement Learning', icon: '🎯' },
      { name: 'Natural Language Processing', icon: '🗣️' },
      { name: 'Computer Vision', icon: '📸' },
      { name: 'stable-baselines3', icon: '🤖' },
    ]
  };

  return (
    <div className="app">
      <header className="terminal-header">
        <div className="terminal-bar">
          <div className="terminal-buttons">
            <span className="terminal-btn close"></span>
            <span className="terminal-btn minimize"></span>
            <span className="terminal-btn maximize"></span>
          </div>
          <div className="terminal-title">kasper@backend:~$</div>
        </div>
      </header>

      <main className="container">
        <section className="hero-section fade-in">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-command">whoami</span>
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="text-gradient">Kasper Larsen</span>
              </h1>
              <p className="hero-subtitle">
                {age} years old | Robotic Engineering Student
              </p>
              <p className="hero-description">
                Building intelligent systems from the ground up. Specializing in backend infrastructure,
                AI/ML pipelines, and autonomous decision-making systems.
              </p>
              <div className="hero-links">
                <a
                  className="social-link"
                  href="https://github.com/dron3flyv3r"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="social-link"
                  href="https://www.linkedin.com/in/kasper-horn-larsen-9146a4238/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
            <div className="hero-image">
              <img src="/profile.jpg" alt="Kasper Larsen" className="profile-photo" />
            </div>
          </div>
        </section>

        <section className="about-section fade-in">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-command">cat aboutme.txt</span>
          </div>

          <div className="about-content">
          <p>
            I'm an engineering student driven by the idea of creating systems that think, learn, and adapt. 
            My work lives where robotics, artificial intelligence, and software design overlap — building tools that feel alive rather than automated.
          </p>
          <p>
            At the center of that vision is SOPA, a smart assistant built to reason and respond on its own. 
            I design its logic, train its models, and shape the interactions so it feels cohesive — an ecosystem that understands context instead of following scripts.
          </p>
          <p>
            Whether I’m building autonomous behaviors or experimenting with new interfaces, I’m exploring how intelligence and design can merge into something natural, efficient, and quietly powerful.
          </p>
        </div>

        </section>

        <section className="skills-section slide-in-left">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-command">cat skills.json</span>
          </div>
          
          <div className="skills-grid">
            <div className="skill-card">
              <h3 className="skill-title">
                <span className="skill-icon">💻</span>
                Languages
              </h3>
              <div className="skill-list">
                {skills.languages.map(lang => (
                  <div key={lang.name} className="skill-item">
                    <div className="skill-bar-container">
                      <div className="skill-name">{lang.name}</div>
                      <div className="skill-level" style={{ color: lang.color }}>
                        {lang.level}
                      </div>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-bar-fill" 
                        style={{ 
                          backgroundColor: lang.color,
                          width: lang.level === 'Expert' ? '100%' :
                                 lang.level === 'Proficient' ? '80%' :
                                 lang.level === 'Intermediate' ? '60%' :
                                 lang.level === 'Knowledgeable' ? '20%'
                                  : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="skill-card">
              <h3 className="skill-title">
                <span className="skill-icon">🛠️</span>
                DevOps & Tools
              </h3>
              <div className="skill-list">
                {skills.tools.map(tool => (
                  <div key={tool.name} className="tool-item">
                    <span className="tool-icon">{tool.icon}</span>
                    <span className="tool-name">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="skill-card">
              <h3 className="skill-title">
                <span className="skill-icon">🧠</span>
                AI & Machine Learning
              </h3>
              <div className="skill-list">
                {skills.ai.map(item => (
                  <div key={item.name} className="ai-item">
                    <span className="ai-icon">{item.icon}</span>
                    <span className="ai-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sopa-section slide-in-right" ref={demoSectionRef}>
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-command">./showcase_sopa.sh</span>
          </div>
          
          <div className="sopa-card">
            <h2 className="sopa-title">
              <span className="text-gradient">SOPA</span> - Smart Operational Personal Assistant
            </h2>
            <p className="sopa-description">
              SOPA is an adaptive AI system that connects intelligence, automation, and design into a single ecosystem capable of understanding context, making decisions, and acting autonomously.
            </p>
            
            <div className="sopa-disclaimer">
              <strong>ℹ️ About this demo:</strong> This showcases a real ONNX-based intent classification system.
              The model was trained on smart-home SOPA interactions and runs entirely in your browser using ONNX Runtime Web.
              <ul>
                <li>Real-time inference with 26MB ONNX model</li>
                <li>tiktoken tokenization (o200k_base vocabulary)</li>
                <li>12 intent classes for smart home commands</li>
                <li>Text normalization and lemmatization preprocessing</li>
              </ul>
              <p>
                Curious about the training pipeline? Explore the full notebooks and scripts at{' '}
                <a
                  href="https://github.com/dron3flyv3r/mini-sopa-intent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  dron3flyv3r/mini-sopa-intent
                </a>.
              </p>
              The full SOPA system extends this with advanced NLU pipelines, reinforcement learning,
              voice processing, and dynamic behavior trees.
            </div>

            {shouldRenderDemo ? (
              <Suspense
                fallback={
                  <div className="intent-demo">
                    <div className="model-loading">
                      <div className="loading-spinner"></div>
                      <span>Preparing interactive demo...</span>
                    </div>
                  </div>
                }
              >
                <IntentDemo />
              </Suspense>
            ) : (
              <div className="intent-demo intent-demo-placeholder">
                <p>Interactive intent classifier loads on demand to keep the page fast.</p>
                <p className="intent-demo-note">Downloads ~26&nbsp;MB ONNX model when activated.</p>
                <button
                  className="demo-button"
                  onClick={() => {
                    loadIntentDemo();
                    setShouldRenderDemo(true);
                  }}
                >
                  Load Interactive Demo
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="projects-section fade-in">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-command">git log --all --graph</span>
          </div>
          
          <h2 className="section-title">Recent Projects</h2>
          
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading repositories...</span>
            </div>
          ) : (
            <div className="projects-grid">
              {repos.slice(0, 6).map((repo) => {
                const updatedAt = formatUpdatedAt(repo.updated_at);
                const homepageUrl = normalizeHomepageUrl(repo.homepage);
                
                const liveStatus = homepageUrl ? liveStatuses[repo.id] ?? 'checking' : null;
                console.table([{ name: repo.name, homepage: homepageUrl, updatedAt }]);

                return (
                  <div 
                    key={repo.id} 
                    className="project-card"
                    onClick={() => setSelectedProject(selectedProject === repo.name ? null : repo.name)}
                  >
                    <div className="project-header">
                      <h3 className="project-name">{repo.name}</h3>
                      {repo.language && (
                        <span className="project-language">{repo.language}</span>
                      )}
                    </div>
                    <p className="project-description">
                      {repo.description?.trim() || 'No description available'}
                    </p>
                    {repo.stars !== undefined && repo.stars > 0 && (
                      <div className="project-stats">
                        <span className="project-stars">⭐ {repo.stars}</span>
                      </div>
                    )}
                    <div className="project-footer">
                      {homepageUrl && (
                        liveStatus === 'up' ? (
                          <a
                            href={homepageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-live project-live-up"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Open live site for ${repo.name}`}
                          >
                            Live
                          </a>
                        ) : liveStatus === 'checking' ? (
                          <span className="project-live project-live-checking" aria-label="Checking live site status">
                            Checking…
                          </span>
                        ) : (
                          <span className="project-live project-live-down" aria-label="Live site unavailable">
                            Down
                          </span>
                        )
                      )}
                      <a 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on GitHub →
                      </a>
                      {updatedAt && (
                        <span className="project-updated" aria-label={`Last updated ${updatedAt}`}>
                          {updatedAt}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="terminal-prompt">
          <span className="prompt-symbol">$</span>
          <span className="prompt-command">exit</span>
        </div>
        <p>Built with React + TypeScript | Deployed on GitHub Pages</p>
      </footer>
    </div>
  );
}
export default App;
