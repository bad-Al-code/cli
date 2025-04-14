export class Timer {
  private readonly durationMs: number;
  private remainingMs: number;

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
    console.log("Timer Start...");
  }

  public stop(): void {
    console.log("Timer Stopping...");
  }

  public getRemainingMs(): number {
    return this.remainingMs;
  }
}
