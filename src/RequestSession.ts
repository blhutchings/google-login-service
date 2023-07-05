import AbstractHandler from "./handlers/abstract/AbstractHandler";
import RetryHandler from "./handlers/session/ResumeHandler";
import RequestContext from "./RequestContext";
import { LoginResponse } from "./types/LoginResponse";



export default class RequestSession {
	private startHandler: AbstractHandler;
	private retryHandler: RetryHandler;
	private requestContext: RequestContext;

	constructor(startHandler: AbstractHandler, retryHandler: RetryHandler, requestContext: RequestContext) {
		this.startHandler = startHandler;
		this.retryHandler = retryHandler;
		this.requestContext = requestContext;
	}

	start(): Promise<LoginResponse> {
		return this.startHandler.handle(this.requestContext);
	}

	retry() {
		return this.retryHandler.handle(this.requestContext);
	}

	getContext() {
		return this.requestContext;
	}
}