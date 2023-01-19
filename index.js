const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { App } = require("octokit");

dotenv.config();
app.use(express.json());

const githubApp = new App({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"),
});

// serve html at / url
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
});

// api for getting all repositories with the app installed
app.get("/get-repos", async function (req, res) {
  let repoNames = [];

  // storing all repo names to an array
  for await (const { repository } of githubApp.eachRepository.iterator()) {
    repoNames.push(repository.full_name);
  }

  res.send(repoNames);
});

// api for deplying test.yml to a github repo
app.get("/deploy/:user/:repo", async function (req, res) {
  let user = req.params.user;
  let repo = req.params.repo;

  try {
    // finding the selected repo
    for await (const {
      repository,
      octokit,
    } of githubApp.eachRepository.iterator()) {
      if (repository.full_name !== `${user}/${repo}`) continue;

      // creating test.yml in .github/workflows folder
      const createFile = await octokit.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner: repository.owner.login,
          repo: repository.name,
          path: ".github/workflows/test.yml",
          message: "Add new test workflow",
          content: fs.readFileSync(
            path.join(__dirname + "/workflows/test.yml"),
            {
              encoding: "base64",
            }
          ),
        }
      );

      console.log(createFile.data);
      res.send({ message: "Success" });
    }
  } catch (err) {
    console.log(err);
    res.send("error");
  }
});

// running express server
let port = 3000;
app.listen(port, () => {
  console.log("Server is running at port: ", port);
  console.log(`Go to http://localhost:${port} to view app`);
});
