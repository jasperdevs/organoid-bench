import { execFileSync } from "node:child_process";

export function runWrangler(args) {
  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/c", "npx", "wrangler", ...args], { stdio: "inherit" });
    return;
  }
  execFileSync("npx", ["wrangler", ...args], { stdio: "inherit" });
}
