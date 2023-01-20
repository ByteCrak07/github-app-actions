const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { App, createNodeMiddleware } = require("octokit");

dotenv.config();
app.use(express.json());

const ghApp = new App({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"),
  webhooks: { secret: process.env.WEBHOOK_SECRET },
  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
});

// serve html at / url
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
});

// routes
require("./routes/getRepos")(app, ghApp);
require("./routes/deploy")(app, ghApp);
require("./routes/rerun")(app, ghApp);
require("./routes/installWorkflowHook")(app, ghApp);

ghApp.webhooks.on("workflow_run", ({ payload }) => {
  console.log(payload.action);
  console.log(payload.workflow_run.name);
  console.log(payload.workflow_run.repository.full_name);
});

app.use(createNodeMiddleware(ghApp));

// running express server
let port = 3000;
app.listen(port, () => {
  console.log("Server is running at port: ", port);
  console.log(`Go to http://localhost:${port} to view app`);
});
