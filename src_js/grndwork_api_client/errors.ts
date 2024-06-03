import {RequestErrorMessage} from './interfaces';

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<RequestErrorMessage> = [],
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  public toString(): string {
    const lines = [
      `${this.name}: ${this.message}`,
    ];

    for (const {field, message} of this.errors) {
      if (message) {
        lines.push(field ? `Field "${field}" ${message.toLowerCase()}` : message);
      }
    }

    return lines.join('\n');
  }
}

export class AuthError extends RequestError {}
