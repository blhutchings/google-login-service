import { LoginErrorStatus } from "../types/LoginErrorStatus";
import { PageState } from "../types/PageState";
import RequestContext from "../RequestContext";

type ErrorOptions = {
	cause?: unknown
}

export class GoogleServiceError extends Error {}

export class GoogleServiceLoginError extends GoogleServiceError {
	statusCode: LoginErrorStatus;
	status: string;

	constructor(status: LoginErrorStatus, message: string, options?: ErrorOptions) {
		super(message, options);
		this.statusCode = status;
		this.status = LoginErrorStatus[status];

	}
}

export class GoogleServiceLoginUndefinedError extends GoogleServiceLoginError {
	state?: PageState;

	constructor(state: PageState, message: string, options?: ErrorOptions) {
		super(LoginErrorStatus.UNDEFINED, message, options);
		this.state = state;
	}
}

export class GoogleServiceLoginErrorFactory {
	static create(status: LoginErrorStatus, message: string): GoogleServiceLoginError {
		return new GoogleServiceLoginError(status, message);
	}

	static async createUndefined(context: RequestContext, message: string): Promise<GoogleServiceLoginUndefinedError> {
		return new GoogleServiceLoginUndefinedError(await PageState.create(context.page), message);
	}
}