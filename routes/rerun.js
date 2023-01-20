module.exports = function (app, ghApp) {
  app.get("/rerun/:user/:repo", async function (req, res) {
    let user = req.params.user;
    let repo = req.params.repo;

    try {
      // finding the selected repo
      for await (const {
        repository,
        octokit,
      } of ghApp.eachRepository.iterator()) {
        if (repository.full_name !== `${user}/${repo}`) continue;

        // for getting id of test.yml
        const workflowRunsData = await octokit.request(
          "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
          {
            owner: repository.owner.login,
            repo: repository.name,
            workflow_id: "test.yml",
          }
        );

        // rerunning test.yml
        const runAction = await octokit.request(
          "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun",
          {
            owner: repository.owner.login,
            repo: repository.name,
            run_id: workflowRunsData.data.workflow_runs[0].id,
          }
        );

        console.log(runAction.data);
        res.send({ message: "Success" });
      }
    } catch (err) {
      console.log(err);
      res.send("error");
    }
  });
};
