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

export interface FeaturedRepo extends Repo {
    blurb?: string | null;
    highlight?: string | null;
    priority?: number | string | null;
}

export interface TimelineItem {
    year: string;
    title: string;
    description: string;
}
