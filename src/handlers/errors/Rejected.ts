import RequestContext from "../../RequestContext.js";
import { LoginErrorStatus } from "../../types/LoginErrorStatus.js";
import { LoginResponse } from "../../types/LoginResponse.js";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError.js";
import AbstractHandler from "../abstract/AbstractHandler.js";

export default class Rejected extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/v3/signin/rejected");
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const message = await context.page.evaluate(() => {
			return String(document.querySelector("form")?.innerText);
		});
		throw GoogleServiceLoginErrorFactory.create(LoginErrorStatus.REJECTED, message);
	}
}