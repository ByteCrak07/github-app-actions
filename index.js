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

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
});

app.get("/get-repos", async function (req, res) {
  let repoNames = [];

  for await (const { repository } of githubApp.eachRepository.iterator()) {
    repoNames.push(repository.full_name);
  }

  res.send(repoNames);
});

app.get("/deploy/:user/:repo", async function (req, res) {
  let user = req.params.user;
  let repo = req.params.repo;

  try {
    for await (const {
      repository,
      octokit,
    } of githubApp.eachRepository.iterator()) {
      if (repository.full_name !== `${user}/${repo}`) continue;

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

let port = 3000;
app.listen(port, () => {
  console.log("Server is running at port: ", port);
  console.log(`Go to http://localhost:${port} to view app`);
});
