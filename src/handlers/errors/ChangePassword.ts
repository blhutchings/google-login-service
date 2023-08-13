import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceErrorFactory } from "../../utils/LoginError";
import AbstractHandler from "../abstract/AbstractHandler";

export default class ChangePassword extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/signin/v2/speedbump/changepassword/changepasswordform");
	}
    
	async handle(context: RequestContext): Promise<LoginResponse> {
		throw GoogleServiceErrorFactory.create(context, LoginErrorStatus.ACTION_REQUIRED, "Account's password must be changed manually before continuing");
	}
}