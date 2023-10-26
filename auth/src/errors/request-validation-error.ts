import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serialize(): { message: string; field?: string | undefined }[] {
    return this.errors.map((error) => ({
      message: error?.msg,
      field: error.type,
    }));
  }
}
