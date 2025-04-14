import process from "node:process";
import * as readline from "node:readline";

import { Timer } from "./core/timer";
import { ArgumentError } from "./errors";
import { displayUsage, performCleanup, HIDE_CURSOR } from "./ui";

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
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const handleKeyPress = (
    str: string,
    key: { name: string; ctrl: boolean }
  ) => {
    if (key.name === "space" || key.name === "p") {
      if (timer.isPaused) {
        process.stdout.write("\n");
        console.log(timer.isPaused ? "Resuming..." : "Pausing...");
      }
      timer.togglePauseResume();
    } else if (key.name === "q") {
      process.stdout.write("\n");
      console.log("Quitting timer manually.");
      timer.stop(false);
      process.exit(0);
    }
  };
  process.stdin.on("keypress", handleKeyPress);
}

function main() {
  process.on("exit", performCleanup);

  let timer: Timer | null = null;

  process.on("SIGINT", () => {
    console.log(`\nCaught interrupt signal (Ctrl+C).`);
    if (timer) timer.stop(false);
    process.exit(0);
  });

  try {
    const durationMinutes = parseArguments();

    console.log("Timer starting...");
    console.log(`Initializing for ${durationMinutes} minute(s).`);
    console.log("Press SPACE or 'p' to pause/resume, 'q' to quit.");

    timer = new Timer(durationMinutes);

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
