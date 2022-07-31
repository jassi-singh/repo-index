import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export type PackInfo = {
  packageName: string;
  version: string;
  registry: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let qs = req.query;
  let packName = qs.packageName;
  let ver = qs.version;
  let reg = qs.registry;

  let packInfo = {
    packageName: packName,
    version: ver,
    registry: reg,
  };
  let baseUrl = `https://ossindex.sonatype.org/api/v3/component-report`;

  const data = {
    coordinates: [
      `pkg:${packInfo.registry}/${packInfo.packageName}@${packInfo.version}`,
    ],
  };

  let ret = await axios.post(baseUrl, data, {
    auth: {
      username: "harshit54@rocketmail.com",
      password: "4qJf@i92G.XqQAz",
    },
  });
  console.log(ret);
  res.status(200).json({ vulnerabilities: ret.data });
}
