import * as readline from "node:readline";

export class Timer {
  private readonly durationMs: number;
  private remainingMs: number;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly tickIntervalMs = 1000;

  constructor(durationMinutes: number) {
    if (durationMinutes < 0) {
      throw new Error("Timer duration must be a positive number.");
    }

    this.durationMs = durationMinutes * 60 * 1000;
    this.remainingMs = this.durationMs;

    console.log(
      `Timer initialized for ${durationMinutes} minute(s). [${this.durationMs}ms]`
    );
  }

  private displyTime(): void {
    const formattedTime = this.formatTime(this.remainingMs);
    const displayString = `Time Remaining: ${formattedTime}`;

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
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;

      process.stdout.write("\n");

      if (completed) {
        console.log("Time's up.");

        process.exit(0);
      } else {
        console.log("Timer stopped manually.");
      }
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
