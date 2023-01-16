import { Repo } from "./repo";
import "./Repo.css"

export function repoBox(repos: Repo[]) {
    return (
        <>
            <h1 className="title">All my projects</h1>
            <div className="repos">
                {repos.map((repo: Repo) => (
                    <div className="repo">
                        <a href={repo.html_url}>
                            <h1>{repo.name.replaceAll("-", " ")}</h1>
                            <p>{repo.description ?? "No description"}</p>

                        </a>
                    </div>
                ))}
            </div>
        </>
    );
}