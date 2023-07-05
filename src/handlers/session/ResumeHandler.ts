import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import AbstractHandler from "../abstract/AbstractHandler";

export default class RetryHandler extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return true;
	}

	handle(context: RequestContext): Promise<LoginResponse> {
		return this.nextHandler(context);
	}
    
}