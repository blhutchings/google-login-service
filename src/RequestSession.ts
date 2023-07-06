import AbstractHandler from "./handlers/abstract/AbstractHandler";
import RequestContext from "./RequestContext";
import { LoginResponse } from "./types/LoginResponse";



export default class RequestSession {
	private startHandler: AbstractHandler;
	private requestContext: RequestContext;

	constructor(startHandler: AbstractHandler, requestContext: RequestContext) {
		this.startHandler = startHandler;
		this.requestContext = requestContext;
	}

	start(): Promise<LoginResponse> {
		return this.startHandler.handle(this.requestContext);
	}

	getContext() {
		return this.requestContext;
	}
}