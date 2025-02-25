import { motion } from "framer-motion";
import type { Repo } from "../types/repo";
import "./RepoBox.css";
import { useEffect, useMemo } from "react";

interface RepoBoxProps {
    repos: Repo[];
}

// Repos to filter out
const FILTERED_PREFIXES = ["SDU", "DRON3FLYV3R"];

export function RepoBox({ repos }: RepoBoxProps) {
    const filteredRepos = useMemo(() => {
        return repos.filter(repo => {
            const upperName = repo.name.toUpperCase();
            return !FILTERED_PREFIXES.some(prefix => upperName === prefix || upperName.startsWith(prefix + "-") || upperName.startsWith(prefix + "_"));
        });
    }, [repos]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const repos = document.querySelectorAll('.repo');
            repos.forEach((repo) => {
                const rect = repo.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
                    (repo as HTMLElement).style.setProperty('--mouse-x', `${x}%`);
                    (repo as HTMLElement).style.setProperty('--mouse-y', `${y}%`);
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };
    
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <>
            <motion.h1 
                className="title"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 400 }}
            >
                Groovy Projects ({filteredRepos.length})
            </motion.h1>
            <motion.div 
                className="repos"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                {filteredRepos.map((repo) => (
                    <motion.div 
                        key={repo.id}
                        className="repo"
                        variants={item}
                        whileHover={{ 
                            scale: 1.03,
                            rotate: -1,
                            transition: { type: "spring", stiffness: 400 }
                        }}
                    >
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            <h1>{repo.name.replaceAll("-", " ")}</h1>
                            <p>{repo.description ?? "No description"}</p>
                        </a>
                    </motion.div>
                ))}
            </motion.div>
        </>
    );
}