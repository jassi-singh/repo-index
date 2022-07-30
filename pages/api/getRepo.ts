// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import url from "node:url";
import axios from "axios";
import { Octokit } from "octokit";
type Data = {
  repoLink: string;
};

enum PackageRegistries {
  npm = "npm",
  pypi = "pypi",
  rubygems = "rubygems",
}

type RepoInfo = {
  user: string;
  repoName: string;
};
const octokit = new Octokit();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log(req.query);
  let link = req.query.link as string;
  let type = req.query.type as PackageRegistries;
  let repoInfo: RepoInfo;

  switch (type) {
    case PackageRegistries.npm:
      repoInfo = await npmToGithub(link);
      break;
    case PackageRegistries.pypi:
      repoInfo = await pypiToGitHub(link);
      break;
    case PackageRegistries.rubygems:
      repoInfo = await rubygemsToGitHub(link);
  }

  const repoData = await octokit.request(
    `GET /repos/${repoInfo.user}/${repoInfo.repoName}`,
    {
      owner: repoInfo.user,
      repo: repoInfo.repoName,
    }
  );
  const ownerInfo = await octokit.request(`GET /users/${repoInfo.user}`, {
    username: repoInfo.user,
  });

  res.status(200).json({ repoData: repoData, ownerInfo: ownerInfo });
}

async function npmToGithub(link: string): Promise<RepoInfo> {
  let parsedLink = url.parse(link);
  let packageName = parsedLink.path?.split("/")[2];
  let registryURL = "https://registry.npmjs.com/" + packageName;
  console.log("NPM Registry URL: ", registryURL);
  let response: any = await axios.get(registryURL);
  let repoURL = response.data.repository.url;
  let parsedURL = url.parse(repoURL);
  let parsedPath = parsedURL.path!.split("/");
  let user = parsedPath[1];
  let repo = parsedPath[2];
  if (repo.slice(-4) == ".git") repo = repo.slice(0, -4);
  return { user: user, repoName: repo };
}

async function pypiToGitHub(link: string): Promise<RepoInfo> {
  link = link.replace("project", "pypi");
  if (link.slice(-1) == "/") link += "json";
  else link += "/json";
  let registryURL = link;
  console.log("PYPI Registry URL: ", registryURL);
  let response: any = await axios.get(registryURL);
  let repoURL = response.data.info.project_urls["Source Code"];
  let parsedURL = url.parse(repoURL);
  let parsedPath = parsedURL.path!.split("/");
  let user = parsedPath[1];
  let repo = parsedPath[2];
  if (repo.slice(-4) == ".git") repo = repo.slice(0, -4);
  return { user: user, repoName: repo };
}

async function rubygemsToGitHub(link: string): Promise<RepoInfo> {
  if (link[link.length - 1] == "/") link = link.slice(0, -1);
  let linkSplit = link.split("/");
  let packageName = linkSplit[linkSplit.length - 1];
  let registryURL = "https://rubygems.org/api/v1/gems/" + packageName + ".json";
  console.log("RubyGems Registry URL", registryURL);
  let response: any = await axios.get(registryURL);
  let repoURL = response.data.source_code_uri;
  let parsedURL = url.parse(repoURL);
  let parsedPath = parsedURL.path!.split("/");
  let user = parsedPath[1];
  let repo = parsedPath[2];
  if (repo.slice(-4) == ".git") repo = repo.slice(0, -4);
  return { user: user, repoName: repo };
}
