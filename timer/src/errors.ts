export class CliTimerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ArgumentError extends CliTimerError {
  constructor(message: string) {
    super(message);
  }
}

export class TimerConfigError extends CliTimerError {
  constructor(message: string) {
    super(message);
  }
}
