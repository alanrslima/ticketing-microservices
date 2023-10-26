export abstract class CustomError extends Error {
  constructor(message: string) {
    super();
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract statusCode: number;
  abstract serialize(): { message: string; field?: string }[];
}
