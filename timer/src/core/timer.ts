import { throws } from "node:assert";
import * as readline from "node:readline";

export class Timer {
  private readonly durationMs: number;
  private remainingMs: number;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly tickIntervalMs = 1000;
  private isPaused: boolean = false;
  private readonly progressBarLength = 20;
  private readonly progressCharFilled = "█";
  private readonly progressCharEmpty = "░";

  constructor(durationMinutes: number) {
    if (durationMinutes < 0) {
      throw new Error("Timer duration must be a positive number.");
    }

    this.durationMs = durationMinutes * 60 * 1000;
    this.remainingMs = this.durationMs;
    this.isPaused = false;

    console.log(
      `Timer initialized for ${durationMinutes} minute(s). [${this.durationMs}ms]`
    );
  }

  private displyTime(): void {
    const formattedTime = this.formatTime(this.remainingMs);
    let displayString = `Time Remaining: ${formattedTime}`;

    let progressPercentage = 0;
    if (this.durationMs > 0) {
      const elapsedMs = Math.min(
        this.durationMs,
        this.durationMs - this.remainingMs
      );
      progressPercentage = elapsedMs / this.durationMs;
    }

    const filledChars = Math.round(progressPercentage * this.progressBarLength);
    const emptyChars = this.progressBarLength - filledChars;

    const progressBar =
      "[" +
      this.progressCharFilled.repeat(filledChars) +
      this.progressCharEmpty.repeat(emptyChars) +
      "]";

    displayString += ` ${progressBar}`;

    if (this.isPaused) {
      displayString += " (Paused)";
    }

    readline.cursorTo(process.stdout, 0);
    process.stdout.write(displayString);
    readline.clearLine(process.stdout, 1);
  }

  public start(): void {
    if (this.intervalId !== null) {
      console.warn("Timer is already running.");
      return;
    }

    console.log("Timer starting...");

    this.displyTime();

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  private tick(): void {
    if (this.isPaused) {
      return;
    }

    this.remainingMs -= this.tickIntervalMs;

    if (this.remainingMs < 0) {
      this.remainingMs = 0;
    }

    this.displyTime();

    if (this.remainingMs === 0) {
      this.stop(true);
    }
  }

  public stop(completed: boolean = false): void {
    const wasTicking = this.intervalId !== null;
    const wasPaused = this.isPaused;
    const intervalToClear = this.intervalId;

    if (wasTicking && intervalToClear) {
      clearInterval(intervalToClear);
    }

    this.intervalId = null;
    this.isPaused = false;

    if (wasTicking || wasPaused) {
      process.stdout.write("\n");

      if (completed) {
        console.log("Time's up!");

        process.exit(0);
      } else {
        console.log("Timer stopped manually.");
      }
    }
  }

  public pause(): void {
    if (this.intervalId === null || this.isPaused) {
      return;
    }

    this.isPaused = true;
    clearInterval(this.intervalId);
    this.intervalId = null;

    console.log(`
    \nTimer paused.
    `);

    this.displyTime();
  }

  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    if (this.remainingMs <= 0) {
      console.warn(`Timer cannot be resumed: time already up`);

      return;
    }

    this.isPaused = false;
    console.log("\nTimer resumed.");

    this.displyTime();

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  public togglePauseResume(): void {
    if (this.isPaused) {
      this.resume();
    } else if (this.intervalId !== null) {
      this.pause();
    }
  }

  public getRemainingMs(): number {
    return this.remainingMs;
  }

  private logRemainingTime(): void {
    const formattedTime = this.formatTime(this.remainingMs);
    console.log(`Remaining:${formattedTime}`);
  }

  private formatTime(ms: number): string {
    if (ms < 0) ms = 0;

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    return `${paddedMinutes}:${paddedSeconds}`;
  }
}
