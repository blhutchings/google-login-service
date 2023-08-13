import { LoginErrorStatus } from "../types/LoginErrorStatus";
import { PageState } from "../types/PageState";
import RequestContext from "../RequestContext";

type ErrorOptions = {
	cause?: unknown
}

export class GoogleServiceError extends Error {

	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

export class GoogleServiceLoginError extends GoogleServiceError {
	statusCode: LoginErrorStatus;
	status: string;
	context?: RequestContext;

	constructor(context: RequestContext, status: LoginErrorStatus, message: string, options?: ErrorOptions) {
		super(message, options);
		this.statusCode = status;
		this.status = LoginErrorStatus[status];
		this.context = context;
	}
}

export class GoogleServiceLoginUndefinedError extends GoogleServiceLoginError {
	state?: PageState;

	constructor(context: RequestContext, state: PageState, message: string, options?: ErrorOptions) {
		super(context, LoginErrorStatus.UNDEFINED, message, options);
		this.state = state;
	}
}

export class GoogleServiceErrorFactory {
	static create(context: RequestContext, status: LoginErrorStatus, message: string): GoogleServiceLoginError {
		return new GoogleServiceLoginError(context, status, message);
	}

	static async createUndefined(context: RequestContext, message: string): Promise<GoogleServiceLoginUndefinedError> {
		return new GoogleServiceLoginUndefinedError(context, await PageState.create(context.page), message);
	}
}