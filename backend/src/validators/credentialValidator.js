const CODE_PATTERN = /^\d{4,10}$/;

function normalizeCode(rawCode) {
  if (rawCode === null || rawCode === undefined) {
    return "";
  }
  return String(rawCode).trim();
}

function isCodeFormatValid(code) {
  return CODE_PATTERN.test(code);
}

function normalizeCredential(entry) {
  return {
    code: normalizeCode(entry.code),
    username: String(entry.username || "").trim(),
    password: String(entry.password || "").trim(),
    used: Boolean(entry.used),
    consumedAt: entry.consumedAt || null
  };
}

function isCredentialEntryValid(entry) {
  return (
    isCodeFormatValid(entry.code) &&
    typeof entry.username === "string" &&
    entry.username.length > 0 &&
    typeof entry.password === "string" &&
    entry.password.length > 0
  );
}

module.exports = {
  normalizeCode,
  isCodeFormatValid,
  normalizeCredential,
  isCredentialEntryValid
};
