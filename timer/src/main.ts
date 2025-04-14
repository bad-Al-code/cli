import process from "node:process";
import * as readline from "node:readline";

import { Timer } from "./core/timer";
import { privateDecrypt } from "node:crypto";

const HIDE_CURSOR = "\x1B[?25l";
const SHOW_CURSOR = "\x1B[?25h";

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
  const durationMinutes = parseFloat(durationArg);

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    console.error(
      `Error: Invalid duration "${durationArg}". Please provide a positive number of minutes.`
    );
    displayUsage();

    return null;
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
    if (key.ctrl && (key.name === "c" || key.name === "d")) {
      return;
    }

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
  process.on("exit", () => {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
  });

  process.on("SIGINT", () => {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
  });
}

function main() {
  const durationMinutes = parseArguments();

  if (durationMinutes === null) {
    const userRequestedHelp = process.argv
      .slice(2)
      .some((arg) => arg === "--help" || arg === "-h");
    process.exit(userRequestedHelp ? 0 : 1);
  }

  console.log(
    "Press SPACE or 'p' to pause/resume, 'q' to quit, Ctrl+C to exit."
  );

  process.on("exit", (code) => {
    process.stdout.write(SHOW_CURSOR);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
  });

  try {
    const timer = new Timer(durationMinutes);

    process.on("SIGINT", () => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      console.log(`\nCaught interrupt singnal (Ctrl+C).`);
      timer.stop(false);

      process.exit(0);
    });

    setupInputListener(timer);

    process.stdout.write(HIDE_CURSOR);

    timer.start();
  } catch (error) {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

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
