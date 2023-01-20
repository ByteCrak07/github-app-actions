module.exports = function (app, ghApp) {
  // api for getting all repositories with the app installed
  app.get("/get-repos", async function (req, res) {
    let repoNames = [];

    // storing all repo names to an array
    for await (const { repository } of ghApp.eachRepository.iterator()) {
      repoNames.push(repository.full_name);
    }

    res.send(repoNames);
  });
};
