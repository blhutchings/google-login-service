import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceErrorFactory } from "../../utils/LoginError";
import AbstractHandler from "../abstract/AbstractHandler";

export default class DeniedSignInRejected extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/signin/v2/deniedsigninrejected");
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const message = await context.page.evaluate(() => {
			return String(document.querySelector("form")?.innerText);
		});
		throw GoogleServiceErrorFactory.create(context, LoginErrorStatus.REJECTED, message);
	}
}