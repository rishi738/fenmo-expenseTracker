function log(level, message, meta = {}) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta)
};
