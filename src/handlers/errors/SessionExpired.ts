import RequestContext from "../../RequestContext.js";
import { LoginErrorStatus } from "../../types/LoginErrorStatus.js";
import { LoginResponse } from "../../types/LoginResponse.js";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError.js";
import AbstractHandler from "../abstract/AbstractHandler.js";

export default class SessionExpired extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/info/sessionexpired");
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const errorMessage = await context.page.evaluate(() => {
			return String(document.querySelector<HTMLDivElement>("div#headingSubtext")?.innerText);
		});
		throw GoogleServiceLoginErrorFactory.create(LoginErrorStatus.SESSION_EXPIRED, errorMessage);
	}
    
}