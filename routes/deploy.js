const fs = require("fs");
const path = require("path");

module.exports = function (app, ghApp) {
  // api for deplying test.yml to a github repo
  app.get("/deploy/:user/:repo", async function (req, res) {
    let user = req.params.user;
    let repo = req.params.repo;

    try {
      // finding the selected repo
      for await (const {
        repository,
        octokit,
      } of ghApp.eachRepository.iterator()) {
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
              path.join(path.resolve(__dirname, "..") + "/workflows/test.yml"),
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
};
