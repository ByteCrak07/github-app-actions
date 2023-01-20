module.exports = function (app, ghApp) {
  app.get("/install-workflow-hook/:user/:repo", async function (req, res) {
    let user = req.params.user;
    let repo = req.params.repo;

    try {
      // finding the selected repo
      for await (const {
        repository,
        octokit,
      } of ghApp.eachRepository.iterator()) {
        if (repository.full_name !== `${user}/${repo}`) continue;

        // create new webhook
        const createWebhook = await octokit.request(
          "POST /repos/{owner}/{repo}/hooks",
          {
            owner: repository.owner.login,
            repo: repository.name,
            name: "web",
            events: ["workflow_run"],
            config: {
              url: `${process.env.WEBHOOK_URL}`,
              secret: "development",
              content_type: "json",
              insecure_ssl: "0",
            },
          }
        );

        console.log(createWebhook.data);
        res.send({ message: "Success" });
      }
    } catch (err) {
      console.log(err);
      res.send("error");
    }
  });
};
