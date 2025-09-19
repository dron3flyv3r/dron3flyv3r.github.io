import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { Repo } from './types/repo';
import { TypeAnimation } from 'react-type-animation';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const age = Math.floor((new Date().getTime() - new Date(2003, 6, 18).getTime()) / 3.15576e+10);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');

  // Color palette for language tags
  const languageColors = [
    { bg: '#3776ab', text: 'white' }, // Python blue
    { bg: '#f7df1e', text: 'black' }, // JavaScript yellow
    { bg: '#3178c6', text: 'white' }, // TypeScript blue
    { bg: '#e34f26', text: 'white' }, // HTML orange
    { bg: '#1572b6', text: 'white' }, // CSS blue
    { bg: '#f34b7d', text: 'white' }, // C++ pink
    { bg: '#00d4aa', text: 'white' }, // Teal
    { bg: '#ff6b6b', text: 'white' }, // Red
    { bg: '#4ecdc4', text: 'white' }, // Mint
    { bg: '#45b7d1', text: 'white' }, // Sky blue
    { bg: '#96ceb4', text: 'black' }, // Sage green
    { bg: '#feca57', text: 'black' }, // Orange
    { bg: '#ff9ff3', text: 'black' }, // Pink
    { bg: '#54a0ff', text: 'white' }, // Blue
    { bg: '#5f27cd', text: 'white' }, // Purple
  ];

  let cacheColors = new Map<string, { bg: string, text: string }>();

  // Function to get consistent color for a language
  const getLanguageColor = (language: string) => {
    if (!language) return languageColors[0];

    // Check cache
    if (cacheColors.has(language)) {
      return cacheColors.get(language)!;
    }

    // Create a simple hash of the language name to ensure consistency
    let hash = 0;
    for (let i = 0; i < language.length; i++) {
      const char = language.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get a valid index
    const colorIndex = Math.abs(hash) % languageColors.length;
    // Cache the color
    cacheColors.set(language, languageColors[colorIndex]);
    return languageColors[colorIndex];
  };

  // Easter eggs state
  const [clickCount, setClickCount] = useState(0);
  const [jukeboxOpen, setJukeboxOpen] = useState(false);
  const [dinerMode, setDinerMode] = useState(false);

  // Jukebox easter egg
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(70);
  
  const songs = [
    { 
      title: "50s Pinup", 
      artist: "Retro Vibes",
      file: "/music/50s-pinup-full-354703.mp3"
    },
    { 
      title: "50s Surfing Music", 
      artist: "Beach Rockers",
      file: "/music/50s-surfing-music-full-354690.mp3"
    },
    { 
      title: "Backseat Bop", 
      artist: "Rock & Roll Gang",
      file: "/music/backseat-bop-1950s-style-rock-and-roll-song-337029.mp3"
    },
    { 
      title: "Milkshake Girl", 
      artist: "Diner Dreams",
      file: "/music/milkshake-girl-full-354704.mp3"
    },
    { 
      title: "Poodle Skirt Swirl", 
      artist: "Sock Hop Stars",
      file: "/music/poodle-skirt-swirl-1950s-rock-and-roll-song-337053.mp3"
    },
    { 
      title: "Rock Doo-Wop", 
      artist: "A Cappella Cats",
      file: "/music/rock-doo-wop-a-capella-vintage-1950x27s-retro-music-110968.mp3"
    }
  ];

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Easter egg: clicking the vinyl record 7 times opens jukebox
  const handleVinylClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 === 7) {
      setJukeboxOpen(true);
      setClickCount(0);
    }
  };

  // Close jukebox and pause music
  const closeJukebox = () => {
    setJukeboxOpen(false);
    pauseCurrentSong();
  };

  // Easter egg: typing "diner" anywhere activates diner mode
  useEffect(() => {
    let typedKeys = '';
    const handleKeyPress = (e: KeyboardEvent) => {
      typedKeys += e.key.toLowerCase();
      if (typedKeys.includes('diner')) {
        setDinerMode(prev => !prev);
        typedKeys = '';
      }
      if (typedKeys.length > 10) {
        typedKeys = typedKeys.slice(-5);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Audio control functions for jukebox
  const playCurrentSong = () => {
    if (audioRef) {
      audioRef.src = songs[currentSong].file;
      audioRef.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const pauseCurrentSong = () => {
    if (audioRef) {
      audioRef.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseCurrentSong();
    } else {
      playCurrentSong();
    }
  };

  const nextSong = () => {
    const newIndex = (currentSong + 1) % songs.length;
    setCurrentSong(newIndex);
    if (isPlaying && audioRef) {
      audioRef.src = songs[newIndex].file;
      audioRef.play().catch(console.error);
    }
  };

  const prevSong = () => {
    const newIndex = (currentSong - 1 + songs.length) % songs.length;
    setCurrentSong(newIndex);
    if (isPlaying && audioRef) {
      audioRef.src = songs[newIndex].file;
      audioRef.play().catch(console.error);
    }
  };

  const selectSong = (index: number) => {
    setCurrentSong(index);
    if (audioRef) {
      audioRef.src = songs[index].file;
      if (isPlaying) {
        audioRef.play().catch(console.error);
      }
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef) {
      audioRef.volume = newVolume / 100;
    }
  };

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audio.onended = () => {
      nextSong();
    };
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    setAudioRef(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Fetch repos from static JSON (updated monthly via GitHub Action)
  useEffect(() => {
    const fetchStaticRepos = async () => {
      try {
        const cachedRepos = localStorage.getItem('github-repos');
        const cacheTimestamp = localStorage.getItem('github-repos-timestamp');
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

        if (cachedRepos && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
          if (!isExpired) {
            setRepos(JSON.parse(cachedRepos));
            setLoading(false);
            return;
          }
        }

        setLoading(true);
        setError(null);

        // Raw GitHub URL to static JSON committed in repo
        const RAW_URL = 'https://raw.githubusercontent.com/dron3flyv3r/dron3flyv3r.github.io/refs/heads/gh-pages/repos.json';

        let data = null;
        try {
          const res = await fetch(RAW_URL, { cache: 'no-store' });
            if (res.ok) {
              data = await res.json();
            } else {
              throw new Error('Raw fetch failed');
            }
        } catch {
          // Fallback to locally served file (dev server / deployed copy)
          const fallback = await fetch('/repos.json');
          if (!fallback.ok) throw new Error('Failed to load repositories');
          data = await fallback.json();
        }

        if (!Array.isArray(data)) throw new Error('Unexpected repos format');

        const sanitized: Repo[] = data.map((r: any) => ({
          name: r.name,
          description: r.description,
          html_url: r.html_url,
          id: r.id,
          language: r.language,
          stars: r.stars,
          updated_at: r.updated_at
        }));

        localStorage.setItem('github-repos', JSON.stringify(sanitized));
        localStorage.setItem('github-repos-timestamp', Date.now().toString());
        setRepos(sanitized);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchStaticRepos();
  }, []);

  // Smooth scroll navigation for repos with looping
  const scrollToRepo = (direction: 'left' | 'right') => {
    const carousel = document.querySelector('.projects-scroll-container');
    if (!carousel) return;
    
    const cardWidth = 340; // Card width + gap
    const scrollAmount = cardWidth * (isMobile ? 1 : 2);
    const { scrollLeft, scrollWidth, clientWidth } = carousel;
    
    if (direction === 'right') {
      // If at the end, loop back to beginning
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        carousel.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        carousel.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    } else {
      // If at the beginning, loop to end
      if (scrollLeft <= 10) {
        carousel.scrollTo({
          left: scrollWidth - clientWidth,
          behavior: 'smooth'
        });
      } else {
        carousel.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
    
    // Update scroll button states after animation
    setTimeout(() => {}, 300);
  };

  // Navigation function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Account for fixed navigation
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Update scroll buttons when repos change
  useEffect(() => {
    if (repos.length > 0) {
      // No need to update buttons since they're always enabled with looping
    }
  }, [repos]);

  // Intersection observer for active section tracking
  useEffect(() => {
    const sections = ['home', 'about', 'projects'];
    const observers = sections.map(sectionId => {
      const element = document.getElementById(sectionId);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          }
        },
        { 
          threshold: 0.3,
          rootMargin: '-100px 0px -100px 0px'
        }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <div className={`retro-app ${dinerMode ? 'diner-mode' : ''}`}>
      {/* Background Pattern */}
      <div className="retro-bg-pattern" />
      
      {/* Navigation Tabs */}
      <nav className="retro-nav">
        <div className="nav-tabs">
          <motion.button 
            className={`nav-tab ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => scrollToSection('home')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Home
          </motion.button>
          <motion.button 
            className={`nav-tab ${activeSection === 'about' ? 'active' : ''}`}
            onClick={() => scrollToSection('about')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            About
          </motion.button>
          <motion.button 
            className={`nav-tab ${activeSection === 'projects' ? 'active' : ''}`}
            onClick={() => scrollToSection('projects')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Projects
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        id="home"
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-content">
          <motion.div 
            className="profile-area"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="polaroid">
              <motion.img 
                src="https://avatars.githubusercontent.com/u/84443539?s=400&u=ce6998ef41de59c4926832c1c76feaff423b3973&v=4" 
                alt="Kasper H. Larsen"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="polaroid-caption">Kasper '25</div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-text"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="hero-title">
              <span className="retro-text-shadow">Kasper Larsen</span>
            </h1>
            <h2 className="hero-subtitle">Danish Engineering Student</h2>
            
            <div className="typewriter-container">
              <TypeAnimation
                sequence={[
                  "Building AI Assistant SOPA 🤖",
                  2000,
                  "Robotics Systems Engineering 🔧",
                  2000,
                  "Python & PyTorch Developer 🐍",
                  2000,
                  "React & Next.js Creator ⚛️",
                  2000,
                  "Computer Vision Enthusiast 👁️",
                  2000,
                  "IoT & Smart Home Integrator 🏠",
                  2000,
                ]}
                repeat={Infinity}
                wrapper="div"
                className="typewriter-text"
                speed={50}
                cursor={true}
              />
            </div>

            <motion.div 
              className="hero-buttons"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <motion.a 
                href="https://github.com/dron3flyv3r"
                className="retro-button primary"
                whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(255, 198, 12, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                View GitHub
              </motion.a>
              <motion.a 
                href="mailto:contact@kasperlarsen.tech"
                className="retro-button secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get In Touch
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="vinyl-player">
          <motion.div 
            className="vinyl-record"
            onClick={handleVinylClick}
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            title="Click me 7 times for a surprise!"
          >
            <div className="vinyl-center" />
            <div className="vinyl-grooves" />
          </motion.div>
          <div className="vinyl-tonearm" />
        </div>

        <div className="retro-shapes">
          <motion.div 
            className="shape triangle"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="shape circle"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="shape square"
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about"
        className="about-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="section-container">
          <motion.h2 
            className="section-title"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            About This Cat
          </motion.h2>
          
          <div className="about-content">
            <motion.div 
              className="about-text"
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p>
                Hey there, daddy-o! I'm Kasper, a {age}-year-old Danish engineering student who's absolutely 
                crazy about robotics and AI. Currently grooving through my 5th semester of Robotics Systems 
                Engineering at the University of Southern Denmark, and I'm heading to sunny Bilbao, Spain 
                for an exchange program that's gonna be the cat's pajamas!
              </p>
              
              <p>
                My pride and joy is <strong>SOPA</strong> - an AI assistant that's more sophisticated than 
                a Cadillac Eldorado! This baby features voice interaction, intent classification with 
                DistilBERT + LSTM, modular protocols, and even integrates with Home Assistant. 
                It's the bee's knees of smart home automation!
              </p>

              <p>
                When I'm not coding up a storm, you'll find me tinkering with ESP32-CAMs, 
                training reinforcement learning agents, or exploring the wild world of computer vision. 
                I dig everything from PyTorch to React, and I'm always ready to learn something new 
                that'll knock your socks off!
              </p>
            </motion.div>

            <motion.div 
              className="tech-stack"
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>Tech Stack That's the Real McCoy</h3>
              <div className="tech-grid">
                <div className="tech-category">
                  <h4>AI & ML</h4>
                  <span>PyTorch • TensorRT • ONNX • Stable-Baselines3</span>
                </div>
                <div className="tech-category">
                  <h4>Languages</h4>
                  <span>Python • C++ • TypeScript • Java</span>
                </div>
                <div className="tech-category">
                  <h4>Web & Mobile</h4>
                  <span>React • Next.js • Flutter • Dear PyGui</span>
                </div>
                <div className="tech-category">
                  <h4>Hardware</h4>
                  <span>ESP32-CAM • Raspberry Pi 4 • IoT Sensors</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Projects Carousel */}
      <motion.section 
        id="projects"
        className="projects-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="section-container">
          <motion.h2 
            className="section-title"
            initial={{ y: -30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Latest Projects Jukebox
          </motion.h2>

          {loading ? (
            <div className="loading-spinner">
              <motion.div 
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <p>Loading the hottest projects...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>Oops! Something went wrong: {error}</p>
            </div>
          ) : (
            <div className="projects-jukebox">
              {!isMobile && (
                <motion.button 
                  className="jukebox-btn prev"
                  onClick={() => scrollToRepo('left')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  ‹
                </motion.button>
              )}

              <div 
                className="projects-scroll-container"
              >
                {repos.map((repo) => (
                  <motion.div
                    key={repo.id}
                    className="project-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="project-header">
                      <h3>{repo.name.replace(/-/g, ' ')}</h3>
                      {repo.language && (
                        <span 
                          className="language-tag"
                          style={{
                            backgroundColor: getLanguageColor(repo.language).bg,
                            color: getLanguageColor(repo.language).text
                          }}
                        >
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <p className="project-description">
                      {repo.description || "No description available"}
                    </p>
                    <div className="project-footer">
                      <span className="stars">⭐ {repo.stars || 0}</span>
                      <motion.a 
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                      >
                        View Project →
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!isMobile && (
                <motion.button 
                  className="jukebox-btn next"
                  onClick={() => scrollToRepo('right')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  ›
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.section>

      {/* Easter Egg: Jukebox Modal */}
      <AnimatePresence>
        {jukeboxOpen && (
          <motion.div 
            className="jukebox-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeJukebox}
          >
            <motion.div 
              className="jukebox"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="jukebox-close"
                onClick={closeJukebox}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Close Jukebox"
              >
                ✕
              </motion.button>
              <h3>🎵 Kasper's Jukebox 🎵</h3>
              <div className="song-list">
                {songs.map((song, index) => (
                  <motion.button
                    key={index}
                    className={`song-btn ${index === currentSong ? 'playing' : ''} ${index === currentSong && isPlaying ? 'now-playing' : ''}`}
                    onClick={() => selectSong(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="song-title">{song.title}</span>
                    <span className="song-artist">{song.artist}</span>
                    {index === currentSong && isPlaying && (
                      <span className="playing-indicator">♪</span>
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="jukebox-controls">
                <motion.button 
                  className="jukebox-control"
                  onClick={prevSong}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Previous Song"
                >
                  ⏮️
                </motion.button>
                <motion.button 
                  className={`jukebox-control play ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlayPause}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </motion.button>
                <motion.button 
                  className="jukebox-control"
                  onClick={nextSong}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Next Song"
                >
                  ⏭️
                </motion.button>
              </div>
              
              <div className="volume-control">
                <label htmlFor="volume">🔊 Volume: {volume}%</label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="volume-slider"
                />
              </div>
              
              <div className="now-playing">
                <span>Now: {songs[currentSong].title}</span>
              </div>
              
              <p className="easter-egg-text">🎉 You found the secret jukebox! 🎉</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="retro-footer">
        <div className="footer-content">
          <p>&copy; 2025 Kasper Larsen • Made with ❤️ and lots of coffee</p>
          <div className="footer-links">
            <motion.a 
              href="https://github.com/dron3flyv3r"
              whileHover={{ scale: 1.1 }}
            >
              GitHub
            </motion.a>
            <motion.a 
              href="https://www.instagram.com/droneflyver/"
              whileHover={{ scale: 1.1 }}
            >
              Instagram
            </motion.a>
            <motion.a 
              href="https://aiviz.kasperlarsen.tech"
              whileHover={{ scale: 1.1 }}
            >
              AI Visualizer
            </motion.a>
          </div>
        </div>
        <div className="easter-egg-hint">
          <p>🎯 Psst... type "diner" anywhere or click the vinyl record 7 times!</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
