const express = require("express");
const {
  normalizeCode,
  isCodeFormatValid,
  normalizeCredential,
  isCredentialEntryValid
} = require("../validators/credentialValidator");
const { findByCode, consumeCode, upsertMany } = require("../services/credentialStore");
const { DATA_FILE_PATH, SINGLE_USE_CODES, ADMIN_TOKEN } = require("../config");

const router = express.Router();

function requireAdmin(req, res) {
  if (!ADMIN_TOKEN) {
    res.status(503).json({
      success: false,
      message: "Admin token is not configured on the server."
    });
    return false;
  }

  const suppliedToken = req.headers["x-admin-token"];
  if (suppliedToken !== ADMIN_TOKEN) {
    res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
    return false;
  }

  return true;
}

router.post("/get-credentials", async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code);

    if (!isCodeFormatValid(code)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid numeric access code."
      });
    }

    const credential = await findByCode(DATA_FILE_PATH, code);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: "Invalid code. Please check and try again."
      });
    }

    if (SINGLE_USE_CODES && credential.used) {
      return res.status(409).json({
        success: false,
        message: "This code has already been used. Contact support desk."
      });
    }

    if (SINGLE_USE_CODES) {
      await consumeCode(DATA_FILE_PATH, code);
    }

    return res.json({
      success: true,
      username: credential.username,
      password: credential.password
    });
  } catch (error) {
    console.error("Failed to process code request:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again shortly."
    });
  }
});

router.post("/admin/bulk-insert", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
    if (entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No entries provided."
      });
    }

    const normalized = entries.map(normalizeCredential);
    const invalid = normalized.find((entry) => !isCredentialEntryValid(entry));

    if (invalid) {
      return res.status(400).json({
        success: false,
        message: "One or more entries are invalid."
      });
    }

    const result = await upsertMany(DATA_FILE_PATH, normalized);
    return res.json({
      success: true,
      message: "Entries inserted successfully.",
      ...result
    });
  } catch (error) {
    console.error("Bulk insert failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to insert records right now."
    });
  }
});

router.post("/admin/update-credential", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const normalized = normalizeCredential(req.body || {});
    if (!isCredentialEntryValid(normalized)) {
      return res.status(400).json({
        success: false,
        message: "Provide valid code, username, and password."
      });
    }

    const result = await upsertMany(DATA_FILE_PATH, [normalized]);
    return res.json({
      success: true,
      message: `Credential updated for code ${normalized.code}.`,
      ...result
    });
  } catch (error) {
    console.error("Single credential update failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update credential right now."
    });
  }
});

router.post("/admin/get-credential", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const code = normalizeCode(req.body?.code);
    if (!isCodeFormatValid(code)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid numeric code."
      });
    }

    const credential = await findByCode(DATA_FILE_PATH, code);
    if (!credential) {
      return res.json({
        success: true,
        found: false,
        code
      });
    }

    return res.json({
      success: true,
      found: true,
      code,
      username: credential.username,
      password: credential.password
    });
  } catch (error) {
    console.error("Admin credential lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to look up credential right now."
    });
  }
});

module.exports = router;
