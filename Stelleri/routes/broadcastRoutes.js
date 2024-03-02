const express = require('express');
const router = express.Router();

router.post('/release', async function (req, res) {
    console.log(req.body);
    console.log(req.headers.authorization);
    res.sendStatus(200);
});

module.exports = router;
