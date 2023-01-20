module.exports = function (app, ghApp) {
  let clients = [];
  let events = [];

  // to subscribe to webhook events of workflow_run
  ghApp.webhooks.on("workflow_run", ({ payload }) => {
    let newEvent = {
      action: payload.action,
      workflow_name: payload.workflow_run.name,
      repository: payload.workflow_run.repository.full_name,
    };

    events = [newEvent, ...events];
    console.log(newEvent);

    // emit event to all clients
    clients.forEach((client) =>
      client.res.write(`data: ${JSON.stringify(events)}\n\n`)
    );
  });

  // server sent events
  app.get("/events", function (req, res) {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);

    const data = `data: ${JSON.stringify(events)}\n\n`;

    res.write(data);

    const clientId = Date.now();

    const newClient = {
      id: clientId,
      res,
    };

    clients.push(newClient);

    req.on("close", () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter((client) => client.id !== clientId);
    });
  });
};
