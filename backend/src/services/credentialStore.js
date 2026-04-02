const fs = require("fs/promises");
const path = require("path");

let writeChain = Promise.resolve();

async function ensureDataFile(filePath) {
  const dirPath = path.dirname(filePath);
  await fs.mkdir(dirPath, { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]\n", "utf8");
  }
}

async function readCredentials(filePath) {
  await ensureDataFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Credential data must be an array");
  }

  return parsed;
}

function writeCredentials(filePath, credentials) {
  writeChain = writeChain.then(async () => {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(credentials, null, 2)}\n`, "utf8");
    await fs.rename(tempPath, filePath);
  });

  return writeChain;
}

async function findByCode(filePath, code) {
  const credentials = await readCredentials(filePath);
  return credentials.find((entry) => entry.code === code) || null;
}

async function consumeCode(filePath, code) {
  const credentials = await readCredentials(filePath);
  const idx = credentials.findIndex((entry) => entry.code === code);

  if (idx === -1) {
    return null;
  }

  credentials[idx] = {
    ...credentials[idx],
    used: true,
    consumedAt: new Date().toISOString()
  };

  await writeCredentials(filePath, credentials);
  return credentials[idx];
}

async function upsertMany(filePath, entries) {
  const credentials = await readCredentials(filePath);
  const byCode = new Map(credentials.map((entry) => [entry.code, entry]));

  for (const entry of entries) {
    byCode.set(entry.code, {
      ...byCode.get(entry.code),
      ...entry,
      used: Boolean(entry.used),
      consumedAt: entry.consumedAt || null
    });
  }

  const merged = Array.from(byCode.values()).sort((a, b) => Number(a.code) - Number(b.code));
  await writeCredentials(filePath, merged);

  return {
    total: merged.length,
    inserted: entries.length
  };
}

module.exports = {
  readCredentials,
  findByCode,
  consumeCode,
  upsertMany
};
