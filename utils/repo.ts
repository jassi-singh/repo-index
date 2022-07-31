import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: "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",
});

export type RepoData = {
  readmeSize?: number;
  stars?: number;
  watchers?: number;
  isForked?: boolean;
  forksCount?: number;
  description?: string;
  repoName?: string;
};

export async function getRepoData(gitUrl: string) {
  const url = new URL(gitUrl);
  const repo = (
    await octokit.request(`GET /repos${url.pathname}`, {
      owner: url.pathname.split("/")[1],
      repo: url.pathname.split("/")[1],
    })
  ).data;
  let repoData: RepoData = {
    readmeSize: 1,
    stars: repo.stargazers_count,
    watchers: repo.subscribers_count,
    isForked: repo.fork,
    forksCount: repo.forks_count,
    description: repo.description,
    repoName: url.pathname.split("/")[1],
  };
  return repoData;
}
