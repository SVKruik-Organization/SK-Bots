const express = require('express');
const router = express.Router();

router.get('/webhook', async function (req, res) {
    const payload = req.body;
    console.log(payload);
    res.sendStatus(200);
});

module.exports = router;
