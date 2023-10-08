import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceErrorFactory } from "../../utils/LoginError";
import AbstractVerificationHandler from "../abstract/AbstractVerificationHandler";


export type TOTPActionHandler = (context: RequestContext, data?: never) => Promise<string>

export default class TOTPVerification extends AbstractVerificationHandler<TOTPActionHandler> {
	readonly type = 6;
    
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/signin/v2/challenge/totp");
	}
    
	protected async handleActionSetup(context: RequestContext): Promise<void> {
		return;
	}
    
	protected async handleActionResponse(context: RequestContext, token?: string): Promise<LoginResponse> {
		if (!token) throw GoogleServiceErrorFactory.create(context, LoginErrorStatus.INVALID_REQUEST, "TOTP response token is empty");

		await context.page.type("input#totpPin", token);
		await context.page.keyboard.press("Enter");

		return this.nextHandler(context);
	} 
}