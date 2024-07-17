const { Request, Response, NextFunction } = require("express");

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
    "authenticateInternalComms": authenticateInternalComms
}