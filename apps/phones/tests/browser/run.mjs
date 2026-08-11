import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const playwrightCli = fileURLToPath(import.meta.resolve("@playwright/test/cli"));
const vinextIndex = import.meta.resolve("vinext");
const vinextCli = fileURLToPath(new URL("cli.js", vinextIndex));
const baseUrl = "http://127.0.0.1:3000";

function waitForExit(child) {
  return new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));
}

async function waitForServer(server) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Production server exited before becoming ready (${server.exitCode})`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The listener is not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Production server did not become ready within 30 seconds");
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  const exited = waitForExit(server);
  server.kill("SIGTERM");
  const stopped = await Promise.race([
    exited.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 3_000))
  ]);
  if (!stopped && server.exitCode === null) {
    server.kill("SIGKILL");
    await exited;
  }
}

const server = spawn(process.execPath, [vinextCli, "start"], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit"
});

let exitCode = 1;
try {
  await waitForServer(server);
  const runner = spawn(process.execPath, [playwrightCli, "test"], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit"
  });
  const result = await waitForExit(runner);
  exitCode = result.code ?? 1;
} finally {
  await stopServer(server);
}

process.exitCode = exitCode;
