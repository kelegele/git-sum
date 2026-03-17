export interface ContributionData {
  date: string;
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
}

export interface Commit {
  repo: string;
  message: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  url: string;
}

export interface PullRequest {
  title: string;
  state: 'open' | 'merged' | 'closed';
  description: string;
  url: string;
  repo: string;
}

export interface Issue {
  title: string;
  state: 'open' | 'closed';
  commentsCount: number;
  url: string;
  repo: string;
}
