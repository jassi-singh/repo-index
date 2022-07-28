// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import url from "node:url";
import axios from "axios";
type Data = {
  repoLink: string;
};

enum PackageRegistries {
  npm = "npm",
  pypi = "pypi",
}

type RepoInfo = {
  user: string;
  repoName: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RepoInfo>
) {
  console.log(req.query);
  let link = req.query.link as string;
  let type = req.query.type as string;
  let repoInfo: RepoInfo;
  if (type == PackageRegistries.npm) repoInfo = await npmToGithub(link);
  else repoInfo = await pypiToGitHub(link);

  res.status(200).json(repoInfo);
}

async function npmToGithub(link: string): Promise<RepoInfo> {
  let parsedLink = url.parse(link);
  let packageName = parsedLink.path?.split("/")[2];
  let registryURL = "https://registry.npmjs.com/" + packageName;
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
  console.log("Registry URL", registryURL);
  let response: any = await axios.get(registryURL);
  // console.log("Reponse: ", response);
  let repoURL = response.data.info.project_urls["Source Code"];
  let parsedURL = url.parse(repoURL);
  let parsedPath = parsedURL.path!.split("/");
  let user = parsedPath[1];
  let repo = parsedPath[2];
  if (repo.slice(-4) == ".git") repo = repo.slice(0, -4);
  return { user: user, repoName: repo };
}
