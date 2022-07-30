import { NextApiRequest, NextApiResponse } from "next";
import {
  getPackageInfoNpm,
  getPackageInfoPypi,
  getPackageInfoRubygems,
} from "../../utils/package";
import { getRepoData } from "../../utils/repo";
import { PackageRegistries } from "./getRepo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.status(200).json(await getPackageInfoRubygems("aws-sdk-core"));
}
