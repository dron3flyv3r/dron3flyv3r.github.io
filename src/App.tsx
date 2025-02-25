import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { Repo } from './types/repo';
import { RepoBox } from './components/RepoBox';
import { TypeAnimation } from 'react-type-animation';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const age = Math.floor((new Date().getTime() - new Date(2003, 6, 18).getTime()) / 3.15576e+10);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add skip link for keyboard users
  const skipToContent = () => {
    const content = document.getElementById('main-content');
    if (content) content.focus();
  };

  // Konami code sequence
  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const [matrixMode, setMatrixMode] = useState(false);
  
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      
      setKonamiCode(prev => {
        const newCode = [...prev, e.key];
        if (newCode.length > konamiSequence.length) {
          return newCode.slice(1);
        }
        return newCode;
      });
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      setMatrixMode(prev => !prev);
      setKonamiCode([]);
    }
  }, [konamiCode]);

  // Secret click counter easter egg
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (clickCount >= 10) {
      setShowSecret(true);
      setTimeout(() => setShowSecret(false), 3000);
      setClickCount(0);
    }
  }, [clickCount]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("https://api.github.com/users/dron3flyv3r/repos?sort=created");
        if (!res.ok) throw new Error('Failed to fetch repositories');
        const rep = await res.json();
        const temp: Repo[] = rep.map((item: Repo) => ({
          name: item.name,
          description: item.description,
          html_url: item.html_url,
          id: item.id
        }));
        setRepos(temp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const introAnimations = {
    hover: {
      scale: 1.02,
      rotate: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98,
      rotate: -1
    }
  };

  const introVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.1 : 0.15,
        delayChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: isMobile ? 10 : 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: isMobile ? 300 : 400,
        damping: isMobile ? 25 : 20,
        duration: 0.5
      }
    }
  };

  const mobileImageVariants = {
    hover: {
      scale: 1.02,
      rotate: -1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.3
      }
    }
  };

  return (
    <div className={`app-container ${matrixMode ? 'matrix-mode' : ''}`}>
      <button onClick={skipToContent} className="skip-link">
        Skip to content
      </button>

      <motion.button
        className="theme-toggle"
        onClick={() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
          setClickCount(prev => prev + 1);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </motion.button>

      {showSecret && (
        <motion.div
          className="secret-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          🎉 You found a secret! Keep clicking for more surprises! 🎉
        </motion.div>
      )}

      <motion.div 
        className="intro"
        variants={introVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="decoration top-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1, delay: 1 }}
        >
          🚀
        </motion.div>
        <motion.div 
          className="decoration bottom-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          💻
        </motion.div>
        <motion.img 
          src="https://avatars.githubusercontent.com/u/84443539?s=400&u=ce6998ef41de59c4926832c1c76feaff423b3973&v=4" 
          alt='Kasper H. Larsen'
          variants={itemVariants}
          whileHover={isMobile ? mobileImageVariants.hover : {
            scale: 1.05, 
            rotate: -3,
            boxShadow: "20px 20px 0px 0px var(--retro-yellow), 35px 35px 60px rgba(0, 0, 0, 0.4)",
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.3
            }
          }}
          transition={{ 
            type: "spring", 
            stiffness: isMobile ? 200 : 300,
            damping: 25,
            duration: 0.5,
            boxShadow: { duration: 0.3 }
          }}
        />
        <motion.div className="content-wrapper" variants={itemVariants}>
          <motion.h1
            variants={itemVariants}
            animate={{ 
              scale: [1, 1.05, 1],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >Hi👋</motion.h1>
          <motion.h2
            variants={itemVariants}
            whileHover={introAnimations.hover}
          >I'm Kasper Larsen</motion.h2>
          <motion.div
            variants={itemVariants}
          >
            <TypeAnimation
              sequence={[
                "I'm a Python dev 🐍",
                1500,
                "I'm a React dev ⚛️",
                1500,
                "I'm a Flutter dev 📱",
                1500,
                "I'm a Photographer 📸",
                1500,
                "I'm a Student 📚",
                1500,
                "I'm a Java dev ☕",
                1500,
                "I'm a Graphic designer 🎨",
                1500,
                "I'm a Web dev 🌐",
                1500,
              ]}
              repeat={Infinity}
              wrapper='h3'
              speed={50}
              style={{ height: '2em' }}
              cursor={true}
            />
          </motion.div>
          <motion.div 
            className='socials'
            variants={itemVariants}
          >
            <motion.a 
              href="https://github.com/dron3flyv3r"
              whileHover={isMobile ? { scale: 1.1 } : { scale: 1.15 }}
              whileTap={{ scale: 0.95, rotate: -3 }}
              transition={{
                type: "spring",
                stiffness: isMobile ? 300 : 400,
                damping: isMobile ? 15 : 10
              }}
            >
              <svg width="75px" height="75px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
                <path fill="#ffc60c" fillRule="evenodd" d="M8 1C4.133 1 1 4.13 1 7.993c0 3.09 2.006 5.71 4.787 6.635.35.064.478-.152.478-.337 0-.166-.006-.606-.01-1.19-1.947.423-2.357-.937-2.357-.937-.319-.808-.778-1.023-.778-1.023-.635-.434.048-.425.048-.425.703.05 1.073.72 1.073.72.624 1.07 1.638.76 2.037.582.063-.452.244-.76.444-.935-1.554-.176-3.188-.776-3.188-3.456 0-.763.273-1.388.72-1.876-.072-.177-.312-.888.07-1.85 0 0 .586-.189 1.924.716A6.711 6.711 0 018 4.381c.595.003 1.194.08 1.753.236 1.336-.905 1.923-.717 1.923-.717.382.963.142 1.674.07 1.85.448.49.72 1.114.72 1.877 0 2.686-1.638 3.278-3.197 3.45.251.216.475.643.475 1.296 0 .934-.009 1.688-.009 1.918 0 .187.127.404.482.336A6.996 6.996 0 0015 7.993 6.997 6.997 0 008 1z" clipRule="evenodd" />
              </svg>
            </motion.a>
            <motion.a 
              href="https://www.instagram.com/droneflyver/"
              whileHover={isMobile ? { scale: 1.1 } : { scale: 1.15 }}
              whileTap={{ scale: 0.95, rotate: 3 }}
              transition={{
                type: "spring",
                stiffness: isMobile ? 300 : 400,
                damping: isMobile ? 15 : 10
              }}
            >
              <svg width="75px" height="75px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.65 7.2H16.66M8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z" stroke="#ffc60c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        id="main-content"
        className="aboute"
        tabIndex={-1}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 70,
            damping: 20
          }
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h1
          initial={{ scale: 0.9, x: -30 }}
          whileInView={{ 
            scale: 1, 
            x: 0,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 15
            }
          }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 20,
              delay: 0.2
            }
          }}
          viewport={{ once: true }}
        >
          My name is Kasper and I'm {age}. I am a programmer and photographer. I am new to the field of AI development,
          but so far I am enjoying it. In addition to programming, I also have experience with graphic design and front-end development.
          Currently, I am learning Flutter to develop mobile apps. <br /> <br />
          I've created a <motion.a 
            href="https://aiviz.kasperlarsen.tech" 
            whileHover={{ scale: 1.05 }} 
            style={{ color: '#ffc60c', textDecoration: 'underline' }}
          >Neural Network Visualizer</motion.a> that helps people understand the basics of AI. 
          It's an interactive tool where you can visualize, train, and experiment with Multi-Layer Perceptron (MLP) neural networks. 
          Perfect for beginners who want to see how non-linear AI models work in real-time! <br /> <br />
          To contact me, send me an E-mail at <a href="mailto:contact@kasperlarsen.tech">contact@kasperlarsen.tech</a>
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {loading ? (
          <motion.div 
            className="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Loading projects...
          </motion.div>
        ) : error ? (
          <motion.div 
            className="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        ) : (
          <RepoBox repos={repos} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
