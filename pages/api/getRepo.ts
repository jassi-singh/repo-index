// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import url from "node:url";
import axios from "axios";
import { Octokit } from "octokit";
import {
  getPackageInfoNpm,
  getPackageInfoPypi,
  getPackageInfoRubygems,
  PackageInfo,
} from "../../utils/package";
type Data = {
  repoLink: string;
};

export enum PackageRegistries {
  npm = "npm",
  pypi = "pypi",
  rubygems = "rubygems",
}

type RepoInfo = {
  user: string;
  repoName: string;
  emails: Array<string>;
};
const octokit = new Octokit();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log(req.query);
  let link = req.query.link as string;
  let type = req.query.type as PackageRegistries;
  let repoInfo = await getRepoInfo(req);

  const repoDat = await octo.request(
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

async function getRepoInfo(req: NextApiRequest): Promise<PackageInfo> {
  let packageInfo: PackageInfo;
  let link = req.query.link as string;
  let type = req.query.type as PackageRegistries;
  let packageName = getPackageNameFromUrl(link);
  switch (type) {
    case PackageRegistries.npm:
      packageInfo = await getPackageInfoNpm(packageName);
      break;
    case PackageRegistries.pypi:
      packageInfo = await getPackageInfoPypi(packageName);
      break;
    case PackageRegistries.rubygems:
      packageInfo = await getPackageInfoRubygems(packageName);
      break;
  }
  return packageInfo;
}

function getPackageNameFromUrl(link: string): string {
  let linkSplit = link.split("/");
  return linkSplit[linkSplit.length - 1] != ""
    ? linkSplit[linkSplit.length - 1]
    : linkSplit[linkSplit.length - 2];
}
