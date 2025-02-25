import { motion } from "framer-motion";
import { Repo } from "./repo";
import "./Repo.css"

export function repoBox(repos: Repo[]) {
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
                Groovy Projects
            </motion.h1>
            <motion.div 
                className="repos"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                {repos.map((repo: Repo) => (
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
                        <a href={repo.html_url}>
                            <h1>{repo.name.replaceAll("-", " ")}</h1>
                            <p>{repo.description ?? "No description"}</p>
                        </a>
                    </motion.div>
                ))}
            </motion.div>
        </>
    );
}