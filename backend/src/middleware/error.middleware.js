import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {

    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
    });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorMiddleware;