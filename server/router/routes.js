function setup({ server, app }) {
  server.get('/goods/:params', (req, res) => {
    const { params } = req.params;
    app.render(req, res, '/goods', { params });
  });
}

module.exports = setup;
