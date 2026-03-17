import { Octokit } from 'octokit';
import type { ContributionData, Commit, PullRequest, Issue } from './types.js';

export class GitHubClient {
  private octokit: Octokit;
  private username: string;

  constructor(token: string, username: string) {
    this.octokit = new Octokit({ auth: token });
    this.username = username;
  }

  async fetchContributions(date: string): Promise<ContributionData> {
    const [commits, pullRequests, issues] = await Promise.all([
      this.fetchCommits(date),
      this.fetchPullRequests(date),
      this.fetchIssues(date),
    ]);

    return { date, commits, pullRequests, issues };
  }

  private async fetchCommits(date: string): Promise<Commit[]> {
    const since = `${date}T00:00:00Z`;
    const until = `${date}T23:59:59Z`;

    const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });

    const commits: Commit[] = [];

    for (const repo of repos) {
      try {
        const { data: repoCommits } = await this.octokit.rest.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          since,
          until,
          per_page: 100,
        });

        for (const commitData of repoCommits) {
          if (commitData.committer?.login !== this.username) continue;
          if (commitData.parents?.length > 1) continue; // Skip merge commits

          commits.push({
            repo: repo.full_name,
            message: commitData.commit.message.split('\n')[0],
            filesChanged: 0,
            additions: 0,
            deletions: 0,
            url: commitData.html_url,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return commits;
  }

  private async fetchPullRequests(date: string): Promise<PullRequest[]> {
    const query = `author:${this.username} created:${date}`;

    const { data: prs } = await this.octokit.rest.search.issuesAndPullRequests({
      q: `${query} is:pr`,
      per_page: 50,
    });

    return prs.items.map((pr) => ({
      title: pr.title,
      state: pr.state as 'open' | 'closed',
      description: pr.body || '',
      url: pr.html_url,
      repo: pr.repository_url.split('/').slice(-2).join('/'),
    }));
  }

  private async fetchIssues(date: string): Promise<Issue[]> {
    const query = `author:${this.username} created:${date}`;

    const { data: issues } = await this.octokit.rest.search.issuesAndPullRequests({
      q: `${query} is:issue`,
      per_page: 50,
    });

    return issues.items.map((issue) => ({
      title: issue.title,
      state: issue.state as 'open' | 'closed',
      commentsCount: issue.comments,
      url: issue.html_url,
      repo: issue.repository_url.split('/').slice(-2).join('/'),
    }));
  }
}
