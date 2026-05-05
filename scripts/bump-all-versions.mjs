import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.join(rootDir, "packages");

const releaseType = process.argv[2] ?? "patch";
const allowedTypes = new Set(["patch", "minor", "major"]);

if (!allowedTypes.has(releaseType)) {
  console.error(`Invalid release type: ${releaseType}`);
  console.error("Allowed values: patch, minor, major");
  process.exit(1);
}

function bumpVersion(version, type) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported semver format: ${version}`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

async function readJson(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const rootPackagePath = path.join(rootDir, "package.json");
  const rootPackageJson = await readJson(rootPackagePath);
  const nextVersion = bumpVersion(rootPackageJson.version, releaseType);

  rootPackageJson.version = nextVersion;
  await writeJson(rootPackagePath, rootPackageJson);

  const packageDirs = await readdir(packagesDir, { withFileTypes: true });
  for (const dirent of packageDirs) {
    if (!dirent.isDirectory()) continue;

    const packageJsonPath = path.join(packagesDir, dirent.name, "package.json");
    const packageJson = await readJson(packageJsonPath);
    packageJson.version = nextVersion;
    await writeJson(packageJsonPath, packageJson);
  }

  console.log(`Bumped all package versions to ${nextVersion}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
