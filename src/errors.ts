/**
 * Typed errors thrown by facades and api handlers. The LAGS dispatcher's
 * single catch block maps these to their HTTP status; anything else that
 * escapes is reported as a 500.
 */
export class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = new.target.name;
        this.status = status;
    }
}

export class ValidationError extends HttpError {
    constructor(message: string) {
        super(400, message);
    }
}

export class AuthError extends HttpError {
    constructor(message: string) {
        super(401, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string) {
        super(409, message);
    }
}
