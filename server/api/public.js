const express = require('express');

const router = express.Router();
const axios = require('axios');

// 活动
function setup(serverUrl) {
  router.get('/live.do', async (req, res) => {
    try {
      const { params, pageno = 1, pagesize = 20 } = req.query;
      let resp = await axios.get(`${serverUrl}/api/v2.0/`)
      res.json(resp.data);
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  });
  return router;
}


module.exports = setup;
