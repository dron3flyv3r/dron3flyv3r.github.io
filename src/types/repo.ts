export interface Repo {
    name: string;
    description: string | null;
    html_url: string;
    id: number;
    language?: string;
    stars?: number;
    updated_at?: string;
    homepage?: string | null;
}
