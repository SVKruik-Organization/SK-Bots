const express = require('express');
const router = express.Router();

router.post('/webhook', async function (req, res) {
    const headers = req.headers;
    const payload = req.body;
    console.log(headers, payload);
    res.sendStatus(200);
});

module.exports = router;
