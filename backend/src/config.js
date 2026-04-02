const path = require("path");

const boolFromEnv = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || "",
  SINGLE_USE_CODES: boolFromEnv(process.env.SINGLE_USE_CODES, false),
  DATA_FILE_PATH: process.env.DATA_FILE_PATH || path.join(__dirname, "..", "data", "credentials.json")
};
