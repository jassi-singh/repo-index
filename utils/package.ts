import axios from "axios";
import { PackageRegistries } from "../pages/api/getRepo";

export type PackageData = {
  type: PackageRegistries;
  packageName: string;
  version: string;
  description: string;
  descriptionExists: boolean;
  versionReleaseCount: number;
  latestReleaseDate: Date;
  originalReleaseDate: Date | null;
  weeklyDownloads: number;
  gitUrlExists: boolean;
  dependencies: number;
  gitUrl: string;
};

export async function getPackageDataNpm(
  packageName: string
): Promise<PackageData> {
  let registryURL = "https://registry.npmjs.com/" + packageName;
  let response: any = await axios.get(registryURL);
  let description = response.data.description;
  let releaseCount = Object.keys(response.data.versions).length;
  let latestRelease = response.data.time.modified;
  let originalRelease = response.data.time.created;
  let response2 = await axios.get(
    `https://api.npmjs.org/versions/${packageName}/last-week`
  );
  let weeklyDownloads = 0;
  for (var key in response2.data.downloads) {
    weeklyDownloads += response2.data.downloads[key];
  }
  let dependencies: Array<string> = [];
  let latestVersion = response.data["dist-tags"].latest;
  // console.log("LATEST:", response.data.versions[latestVersion]);
  let dependencyCount = 0;
  if (response.data.versions[latestVersion].dependencies)
    Object.keys(response.data.versions[latestVersion].dependencies).forEach(
      (dep) => {
        dependencies.push(dep);
      }
    );
  else dependencyCount = -1;

  let rawRepoUrl = response.data.repository.url.split("/");
  let repoUrl = `https://www.github.com/${rawRepoUrl[rawRepoUrl.length - 2]}/${
    rawRepoUrl[rawRepoUrl.length - 1]
  }`;
  if (repoUrl.slice(-4) == ".git") repoUrl = repoUrl.slice(0, -4);
  let packageData: PackageData = {
    type: PackageRegistries.npm,
    version: latestVersion,
    packageName: packageName,
    description: description,
    descriptionExists: description.length > 10,
    latestReleaseDate: new Date(latestRelease),
    originalReleaseDate: originalRelease,
    weeklyDownloads: weeklyDownloads,
    gitUrlExists: response.data.repository.url ? true : false,
    versionReleaseCount: releaseCount,
    dependencies: dependencyCount == -1 ? -1 : dependencies.length,
    gitUrl: repoUrl,
  };
  return packageData;
}

export async function getPackageDataPypi(
  packageName: string
): Promise<PackageData> {
  let registryURL = `https://pypi.org/pypi/${packageName}/json`;
  let response: any = await axios.get(registryURL);
  let description = response.data.info.summary;
  let releaseCount = Object.keys(response.data.releases).length;
  let latestRelease = response.data.urls[0].upload_time_iso_8601;
  let originalRelease = null;
  let response2;
  try {
    response2 = await axios.get(
      `https://pypistats.org/api/packages/${packageName}/recent`
    );
    console.log("response2", response2);
  } catch (error) {}

  let weeklyDownloads =
    response2 === undefined ? -1 : response2.data.data.last_week;

  let repoUrl =
    response.data.info.project_urls["Source Code"] ||
    response.data.info.project_urls["Source"];

  let packageData: PackageData = {
    type: PackageRegistries.pypi,
    packageName: packageName,
    version: response.data.info.version,
    description: description,
    descriptionExists: description.length > 10,
    latestReleaseDate: new Date(latestRelease),
    originalReleaseDate: originalRelease,
    weeklyDownloads: weeklyDownloads,
    gitUrlExists:
      response.data.info.project_urls["Source Code"] ||
      response.data.info.project_urls["Source"]
        ? true
        : false,
    versionReleaseCount: releaseCount,
    dependencies: response.data.info.requires_dist
      ? Object.keys(response.data.info.requires_dist).length
      : -1,
    gitUrl: repoUrl,
  };
  return packageData;
}

export async function getPackageDataRubygems(
  packageName: string
): Promise<PackageData> {
  let registryURL = `https://rubygems.org/api/v1/gems/${packageName}.json`;
  let response: any = await axios.get(registryURL);
  let description = response.data.Data;
  let releaseCount = -1;
  let latestRelease = response.data.version_created_at;
  let originalRelease = null;
  let weeklyDownloads = response.data.version_downloads;

  let repoUrl = response.data.metadata.source_code_uri;

  let packageData: PackageData = {
    type: PackageRegistries.rubygems,
    packageName: packageName,
    version: response.data.version,
    description: description,
    descriptionExists:
      description === undefined ? false : description.length > 10,
    latestReleaseDate: new Date(latestRelease),
    originalReleaseDate: originalRelease,
    weeklyDownloads: weeklyDownloads,
    gitUrlExists: response.data.metadata.source_code_uri ? true : false,
    versionReleaseCount: releaseCount,
    dependencies: response.data.dependencies.runtime
      ? response.data.dependencies.runtime.length
      : -1,
    gitUrl: repoUrl,
  };
  return packageData;
}
