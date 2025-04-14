import { TimerConfigError } from "../errors";
import { updateDisplay } from "../ui";

export class Timer {
  private readonly durationMs: number;
  private remainingMs: number;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly tickIntervalMs = 1000;
  isPaused: boolean = false;

  constructor(durationMinutes: number) {
    if (durationMinutes < 0) {
      throw new TimerConfigError("Timer duration must be a positive number.");
    }

    this.durationMs = durationMinutes * 60 * 1000;
    this.remainingMs = this.durationMs;
    this.isPaused = false;
  }

  public start(): void {
    if (this.intervalId !== null) {
      return;
    }

    updateDisplay(this.remainingMs, this.durationMs, this.isPaused);

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

    updateDisplay(this.remainingMs, this.durationMs, this.isPaused);

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
      // process.stdout.write("\n");

      if (completed) {
        process.exit(0);
      } else {
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

    updateDisplay(this.remainingMs, this.durationMs, this.isPaused);
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

    updateDisplay(this.remainingMs, this.durationMs, this.isPaused);

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
}
