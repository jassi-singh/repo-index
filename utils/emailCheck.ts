const dnsPromises = require("dns").promises;
type RepoInfo = {
  user: string;
  repoName: string;
  emails: Array<string>;
};

type EmailInfo = {
  email: string;
  isValid: boolean;
  hostnameExists: boolean;
};

async function hostnameExists(hostname: string) {
  try {
    await dnsPromises.lookup(hostname);
    return true;
  } catch (_) {
    return false;
  }
}

const validateEmail = (email: string) => {
  return Boolean(
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  );
};

function onlyUnique(value: any, index: any, self: any) {
  return self.indexOf(value) === index;
}


function getValidEmails(repoInfo: RepoInfo) {
  let emails = repoInfo.emails;
  emails = emails.filter(onlyUnique);
  let validEmails: Array<EmailInfo> = [];
  emails.forEach(async (email) => {
    validEmails.push({
      email: email,
      isValid: validateEmail(email),
      hostnameExists: await hostnameExists(email.split("@")[1]),
    });
  });
  return validEmails;
}

function calculateEmailRating(repoInfo: RepoInfo) {
  let emails = repoInfo.emails;
  emails = emails.filter(onlyUnique);
  if (emails.length == 0) return 0;
  let validEmails = getValidEmails(repoInfo);
  return validEmails.length / emails.length;
}
