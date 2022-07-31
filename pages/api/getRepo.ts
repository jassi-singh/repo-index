// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import url from "node:url";
import axios from "axios";
import { Octokit } from "octokit";
import {
  getPackageDataNpm,
  getPackageDataPypi,
  getPackageDataRubygems,
  PackageData,
} from "../../utils/package";
import { getRepoData, RepoData } from "../../utils/repo";

export enum PackageRegistries {
  npm = "npm",
  pypi = "pypi",
  rubygems = "rubygems",
  github = "github",
}

export type RepoAnalysis = {
  packageData: PackageData;
  repoData: RepoData;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let packageData: PackageData | undefined = await getPackageData(req);
  let repoData: RepoData = {};
  if (
    packageData?.gitUrl !== undefined ||
    req.query.type === PackageRegistries.github
  ) {
    const url: string =
      packageData === undefined
        ? (req.query.link as string)
        : packageData?.gitUrl!;
    repoData = await getRepoData(packageData?.gitUrl ?? url);
  }
  res.status(200).json({ packageData, repoData } as RepoAnalysis);
}

async function getPackageData(
  req: NextApiRequest
): Promise<PackageData | undefined> {
  let packageData: PackageData | undefined;
  let link = req.query.link as string;
  let type = req.query.type as PackageRegistries;
  let packageName = getPackageNameFromUrl(link);
  switch (type) {
    case PackageRegistries.npm:
      packageData = await getPackageDataNpm(packageName);
      break;
    case PackageRegistries.pypi:
      packageData = await getPackageDataPypi(packageName);
      break;
    case PackageRegistries.rubygems:
      packageData = await getPackageDataRubygems(packageName);
      break;
  }
  return packageData;
}

function getPackageNameFromUrl(link: string): string {
  let linkSplit = link.split("/");
  return linkSplit[linkSplit.length - 1] != ""
    ? linkSplit[linkSplit.length - 1]
    : linkSplit[linkSplit.length - 2];
}
