export type ExitCode = 1 | 2 | 3 | 4;

export class KitError extends Error {
  constructor(message: string, readonly exitCode: ExitCode) {
    super(message);
    this.name = new.target.name;
  }
}
export class UsageError extends KitError {
  constructor(message: string) { super(message, 1); }
}
export class ValidationError extends KitError {
  constructor(message: string) { super(message, 2); }
}
export class BudgetExceededError extends KitError {
  constructor(message: string) { super(message, 3); }
}
export class ProviderUnavailableError extends KitError {
  constructor(message: string) { super(message, 4); }
}
