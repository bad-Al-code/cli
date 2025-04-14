import * as readline from "node:readline";
import process from "node:process";

export const HIDE_CURSOR = "\x1B[?25l";
export const SHOW_CURSOR = "\x1B[?25h";

const progressBarLength = 20;
const progressCharFilled = "█";
const progressCharEmpty = "░";

function formatTime(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
}

function buildProgressBar(currentMs: number, totalMs: number): string {
  let progressPercentage = 0;
  if (totalMs > 0) {
    const elapsedMs = Math.min(totalMs, totalMs - currentMs);
    progressPercentage = elapsedMs / totalMs;
  }
  const filledChars = Math.round(progressPercentage * progressBarLength);
  const emptyChars = progressBarLength - filledChars;
  return (
    "[" +
    progressCharFilled.repeat(filledChars) +
    progressCharEmpty.repeat(emptyChars) +
    "]"
  );
}

export function updateDisplay(
  remainingMs: number,
  totalDurationMs: number,
  isPaused: boolean
): void {
  const formattedTime = formatTime(remainingMs);
  const progressBar = buildProgressBar(remainingMs, totalDurationMs);

  let displayString = `Time Remaining: ${formattedTime} ${progressBar}`;
  if (isPaused) {
    displayString += " (Paused)";
  }

  readline.cursorTo(process.stdout, 0);
  process.stdout.write(displayString);
  readline.clearLine(process.stdout, 1);
}

export function displayUsage(): void {
  console.log("\nUsage: node dist/main.js <minutes>");
  console.log("Example: node dist/main.js 10");
  console.log("\nOr using npm script");
  console.log("Usage: npm start -- <minutes>");
  console.log("Example: npm start -- 10\n");
}

export function performCleanup(): void {
  process.stdout.write(SHOW_CURSOR);
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(false);
    } catch (e) {
      /* Ignore cleanup errors */
    }
  }
}
