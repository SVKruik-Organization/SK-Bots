const jwt = require('jsonwebtoken');
const jwtSecret = process.env.SERVER_SECRET;
const dateUtils = require('./date.js');
const { Request, Response, NextFunction } = require("express")

/**
 * Check if a Bearer key is still valid.
 * @param {Request} req The Express request.
 * @param {Response} res The Express response.
 * @param {NextFunction} next Send downstream.
 * @returns Unauthorized status code on error.
 */
function authenticateJWT(req, res, next) {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, jwtSecret, (err, operator) => {
            if (err) return res.status(401).send(err.name);
            req.operator = {
                "id": operator.id,
                "snowflake": operator.snowflake,
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

/**
 * Bearer authrentication used for SK Platform products communicating with each other.
 * These, unless hacked, are not accessible to the public.
 * @param {Request} req The Express request.
 * @param {Response} res The Express response.
 * @param {NextFunction} next Send downstream.
 * @returns Unauthorized status code on error.
 */
function authenticateInternalComms(req, res, next) {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token === process.env.INTERNAL_TOKEN) {
            next();
        } else return res.sendStatus(401);
    } else return res.sendStatus(401);
}

module.exports = {
    "authenticateJWT": authenticateJWT,
    "authenticateInternalComms": authenticateInternalComms
}