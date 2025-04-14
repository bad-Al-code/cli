import process from "node:process";
import * as readline from "node:readline";

import { Timer } from "./core/timer";
import { ArgumentError } from "./errors";

const HIDE_CURSOR = "\x1B[?25l";
const SHOW_CURSOR = "\x1B[?25h";

function displayUsage(): void {
  console.log("\nUsage: node dist/main.js <minutes>");
  console.log("Example: node dist/main.js 10");
  console.log("\nOr using npm script");
  console.log("Usage: npm start -- <minutes>");
  console.log("Example: npm start -- 10\n");
}

function parseArguments(): number {
  const args = process.argv.slice(2);

  if (args.length !== 1 || args[0] === "--help" || args[0] === "-h") {
    displayUsage();

    process.exit(0);
  }

  const durationArg = args[0];
  const durationMinutes = parseFloat(durationArg);

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    throw new ArgumentError(
      `Invalid duration "${durationArg}". Please provide a positive number of minutes.`
    );
  }

  return durationMinutes;
}

function setupInputListener(timer: Timer): void {
  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  } else {
    console.warn(
      `Warning: Not running in a TTY. Keystrokes may not be captured for pause/resume.`
    );
  }

  const handleKeyPress = (
    str: string,
    key: {
      sequence: string;
      name: string;
      ctrl: boolean;
      meta: boolean;
      shift: boolean;
    }
  ) => {
    if (key.name === "space" || key.name === "p") {
      timer.togglePauseResume();
    }

    if (key.name === "q") {
      console.log("\nQuitting timer manually.");
      timer.stop(false);
      process.exit(0);
    }
  };

  process.stdin.on("keypress", handleKeyPress);
}

function main() {
  const durationMinutes = parseArguments();

  if (durationMinutes === null) {
    const userRequestedHelp = process.argv
      .slice(2)
      .some((arg) => arg === "--help" || arg === "-h");
    process.exit(userRequestedHelp ? 0 : 1);
  }

  console.log("Press SPACE or 'p' to pause/resume, 'q' to quit.");

  const performCleanup = () => {
    process.stdout.write(SHOW_CURSOR);
    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch (e) {
        // Ignore errors during cleanup, e.g., if stdin closed unexpectedly
      }
    }
  };

  process.on("exit", performCleanup);

  try {
    let timer: Timer | null = null;
    timer = new Timer(durationMinutes);

    process.on("SIGINT", () => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }

      console.log(`\nCaught interrupt signal (Ctrl+C).`);
      if (typeof timer !== "undefined" && timer) {
        timer.stop(false);
      }
      process.exit(0);
    });

    setupInputListener(timer);

    process.stdout.write(HIDE_CURSOR);

    timer.start();
  } catch (error) {
    performCleanup();

    console.error("\n--- Error ---");

    if (error instanceof ArgumentError) {
      console.error(`Configuration Error: ${error.message}`);
      process.exitCode = 1;
    } else if (error instanceof Error) {
      console.error(`Runtime Error: ${error.message}`);
      process.exitCode = 2;
    } else {
      console.error("An unexpected issue occurred:", error);
      process.exitCode = 3;
    }
    console.error("-------------\n");
  }
}

if (require.main === module) {
  main();
}
