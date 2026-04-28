import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found." });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  if (status >= 500) {
    logger.error("unhandled_error", {
      method: req.method,
      path: req.originalUrl,
      error: error.message,
      stack: error.stack
    });
  }

  res.status(status).json({
    message: status >= 500 ? "Something went wrong." : error.message,
    errors: error.details
  });
}
