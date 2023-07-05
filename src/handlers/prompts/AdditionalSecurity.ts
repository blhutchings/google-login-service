import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError";
import AbstractHandler from "../abstract/AbstractHandler";

export default class AdditionalSecurityPrompt extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://gds.google.com/web/chip");
	}
	async handle(context: RequestContext): Promise<LoginResponse> {
		const page = context.page;

		const notNow = await page.$("[data-is-touch-wrapper=\"true\"] > button");
		if (notNow) {
			await notNow.click();
			return this.nextHandler(context);
		} else {
			throw await GoogleServiceLoginErrorFactory.createUndefined(context, "Could not find element to dismiss additional security prompt");
		}
	}
}