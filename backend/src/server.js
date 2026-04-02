require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { PORT } = require("./config");
const credentialsRouter = require("./routes/credentials");

const app = express();
const frontendPath = path.join(__dirname, "..", "..", "frontend");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(morgan("tiny"));

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api", credentialsRouter);
app.use(express.static(frontendPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Conference access server running at http://localhost:${PORT}`);
});
