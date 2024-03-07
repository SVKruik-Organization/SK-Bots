const express = require('express');
const router = express.Router();

router.post('/webhook', async function (req, res) {
    const payload = req;
    console.log(payload);
    res.sendStatus(200);
});

module.exports = router;
