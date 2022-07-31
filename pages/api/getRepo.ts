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
import {
  downloadsWeekly,
  forksCount,
  latestReleaseVersionTime,
  originalReleaseTime,
  releaseVersionCount,
  starsCount,
  watchersCount,
} from "../../utils/metrics";
import { getCVE, PackInfo } from "../../utils/cve";
import { version } from "node:os";

export enum PackageRegistries {
  npm = "npm",
  pypi = "pypi",
  rubygems = "rubygems",
  github = "github",
}

export type RepoAnalysis = {
  packageData: PackageData;
  repoData: RepoData;
  analysis: { totalParams: number; goodParams: number };
  cveData: any;
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
  let cveData;
  if (packageData) {
    cveData = await getCVE({
      packageName: packageData?.packageName,
      version: packageData?.version,
      registry: packageData?.type.toString(),
    } as PackInfo);
  }

  let analysis = {
    totalParams: 10,
    goodParams: 0,
  };
  if (repoData.forksCount !== undefined && repoData.forksCount >= forksCount)
    analysis.goodParams++;
  if (repoData.isForked !== undefined && !repoData.isForked)
    analysis.goodParams++;
  if (repoData.stars !== undefined && repoData.stars >= starsCount)
    analysis.goodParams++;
  if (repoData.watchers !== undefined && repoData.watchers >= watchersCount)
    analysis.goodParams++;

  if (packageData?.gitUrlExists !== undefined && packageData.gitUrlExists)
    analysis.goodParams++;
  if (
    packageData?.originalReleaseDate !== undefined &&
    !checkIfOldEnough(packageData?.originalReleaseDate!)
  )
    analysis.goodParams++;
  if (
    packageData?.latestReleaseDate !== undefined &&
    !checkIfOldVersion(packageData?.latestReleaseDate)
  )
    analysis.goodParams++;
  if (
    packageData?.versionReleaseCount !== undefined &&
    packageData.versionReleaseCount >= releaseVersionCount
  )
    analysis.goodParams++;
  if (
    packageData?.weeklyDownloads !== undefined &&
    packageData.weeklyDownloads >= downloadsWeekly
  )
    analysis.goodParams++;
  if(cveData?.vulnerabilities?.length==0) analysis.goodParams++;

  res
    .status(200)
    .json({ packageData, repoData, analysis, cveData } as RepoAnalysis);
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

export const checkIfOldVersion = (latestReleaseDate: Date): boolean => {
  const date1 = new Date(latestReleaseDate).getTime();
  const date2 = new Date().getTime();
  const diff = ((date2 - date1) / 60) * 60 * 24 * 30;
  if (diff > latestReleaseVersionTime) return false;
  else return true;
};

export const checkIfOldEnough = (releaseDate: Date): boolean => {
  const date1 = new Date(releaseDate).getTime();
  const date2 = new Date().getTime();
  const diff = ((date2 - date1) / 60) * 60 * 24 * 30 * 12;
  if (diff > originalReleaseTime) return false;
  else return true;
};
