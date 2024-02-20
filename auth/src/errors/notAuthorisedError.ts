import { CustomError } from "./customError"

export class NotAuthorisedError extends CustomError {
    statusCode = 401
    constructor() {
        super('Not Authorised')
        Object.setPrototypeOf(this, NotAuthorisedError.prototype)
    }
    serializeErrors() {
        return [{message: 'Not Authorised'}]
    }
}