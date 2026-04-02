const path = require("path");
const { upsertMany } = require("../src/services/credentialStore");

const filePath = path.join(__dirname, "..", "data", "credentials.json");

const seedEntries = [
  { code: "1101", username: "alpha_team", password: "alpha-pass", used: false },
  { code: "1102", username: "beta_team", password: "beta-pass", used: false },
  { code: "1103", username: "gamma_team", password: "gamma-pass", used: false }
];

(async () => {
  try {
    const result = await upsertMany(filePath, seedEntries);
    console.log("Seed complete:", result);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  }
})();
