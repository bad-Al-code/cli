import process from "node:process";

import { Timer } from "./core/timer";

const HIDE_CURSOR = "\x1B[?25l";
const SHOW_CURSOR = "\x1B[?25h";

function cleanupAndExit(exitCode: number = 0): void {
  process.stdout.write(SHOW_CURSOR);
  process.exit(exitCode);
}

function displayUsage(): void {
  console.log("\nUsage: node dist/main.js <minutes>");
  console.log("Example: node dist/main.js 10");
  console.log("\nOr using npm script");
  console.log("Usage: npm start -- <minutes>");
  console.log("Example: npm start -- 10\n");
}

function parseArguments(): number | null {
  const args = process.argv.slice(2);

  if (args.length !== 1 || args[0] === "--help" || args[0] === "-h") {
    displayUsage();

    return null;
  }

  const durationArg = args[0];
  const durationMinutes = Number(durationArg);

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    console.error(
      `Error: Invalid duration "${durationArg}". Please provide a positive number of minutes.`
    );
    displayUsage();

    return null;
  }

  return durationMinutes;
}

function main() {
  const durationMinutes = parseArguments();

  if (durationMinutes === null) {
    const userRequestedHelp = process.argv
      .slice(2)
      .some((arg) => arg === "--help" || arg === "-h");
    process.exit(userRequestedHelp ? 0 : 1);
  }

  process.on("exit", (code) => {
    process.stdout.write(SHOW_CURSOR);
  });

  try {
    const timer = new Timer(durationMinutes);

    process.on("SIGINT", () => {
      console.log(`\nCaught interrupt singnal (Ctrl+C).`);
      timer.stop(false);

      process.exit(0);
    });

    process.stdout.write(HIDE_CURSOR);

    timer.start();
  } catch (error) {
    process.stdout.write(SHOW_CURSOR);

    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`An unexpected error occured during timer setup. `, error);
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
