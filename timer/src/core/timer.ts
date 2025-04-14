import { throws } from "assert";

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

  public start(): void {
    if (this.intervalId !== null) {
      console.warn("Timer is already running.");
      return;
    }

    console.log("Timer starting...");

    this.logRemainingTime();

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
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

  private tick(): void {
    this.remainingMs -= this.tickIntervalMs;

    if (this.remainingMs <= 0) {
      this.remainingMs = 0;
      this.logRemainingTime();
      this.stop();
    } else {
      this.logRemainingTime();
    }
  }

  public stop(completed: boolean = false): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;

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
}
