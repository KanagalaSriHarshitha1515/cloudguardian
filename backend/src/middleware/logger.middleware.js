
import logger from "../utils/logger.js";

const loggerMiddleware = (req, res, next) => {

    const start = Date.now();

    res.on("finish", () => {

        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTime: `${Date.now() - start}ms`,
            ip: req.ip,
        });

    });

    next();
};

export default loggerMiddleware;