import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export type PackInfo = {
  packageName: string;
  version: string;
  registry: string;
};

export async function getCVE(packInfo: PackInfo) {
  try {
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
    console.log("CVES",ret.data[0].vulnerabilities);
    return { vulnerabilities: ret.data[0].vulnerabilities };
  } catch (error) {
    return { vulnerabilities: [] };
  }
}
