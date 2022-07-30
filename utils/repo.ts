import { Octokit } from "octokit";

const octokit = new Octokit();

export type RepoType = {
  readmeSize: number;
  stars: number;
  watchers: number;
  isForked: boolean;
  forksCount: boolean;
  homepage: boolean;
}; 

export async function getRepoData(repoInfo: RepoInfo) {
  const repoData = await octokit.request(
    `GET /repos/${repoInfo.user}/${repoInfo.repoName}`,
    {
      owner: repoInfo.user,
      repo: repoInfo.repoName,
    }
  );
  return repoData;
}
