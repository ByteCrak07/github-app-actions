const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
app.use(express.json());

const { App, Octokit } = require("octokit");
// const {
//   createOrUpdateTextFile,
// } = require("@octokit/plugin-create-or-update-text-file");

// const MyOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
//   userAgent: "boop-jasons-nose-app/v1.0.0",
// });

const octokit = new Octokit();
const githubApp = new App({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"),
});

var repos = {};

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
});

app.get("/get-repos", async function (req, res) {
  let repoNames = [];
  repos = {};

  for await (const {
    repository,
    octokit,
  } of githubApp.eachRepository.iterator()) {
    repoNames.push(repository.full_name);
    repos[repository.full_name] = {
      owner: repository.owner.login,
      repo: repository.name,
      octokit,
    };
  }

  console.log(repos);
  res.send(repoNames);
});

app.get("/deploy/:repo", async function (req, res) {
  let repo = req.params.repo;
  let repoOctokit = repos[repo].octokit;

  const { data } = await repoOctokit.rest.repos.getContent({
    owner: repos[repo].owner,
    repo: repos[repo].name,
    path: "hello.js",
  });

  console.log(data);

  res.send("kiity");
});

let port = 3000;
app.listen(port, () => {
  console.log("Server is running at port: ", port);
});
