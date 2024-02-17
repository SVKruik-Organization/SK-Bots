const jwt = require('jsonwebtoken');
const jwtSecret = process.env.SERVER_TOKEN;
const dateUtils = require('./date.js');

function authenticateJWT(req, res, next) {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, jwtSecret, (err, operator) => {
            if (err) return res.status(401).send(err.name);
            req.operator = {
                "id": operator.id,
                "owner_snowflake": operator.owner_snowflake,
                "snowflake": operator.snowflake,
                "edition": operator.edition,
                "operator_username": operator.operator_username,
                "user_username": operator.user_username,
                "email": operator.email,
                "service_tag": operator.service_tag,
                "avatar": operator.avatar,
                "date_creation": operator.date_creation,
                "jwtIAT": dateUtils.getDate(operator.iat * 1000 + 3600000, null).today,
                "jwtEXP": dateUtils.getDate(operator.exp * 1000 + 3600000, null).today
            };
            next();
        });
    } else return res.sendStatus(401);
}

module.exports = {
    "authenticateJWT": authenticateJWT
}