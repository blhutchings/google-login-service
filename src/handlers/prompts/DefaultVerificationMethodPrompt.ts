import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceErrorFactory } from "../../utils/LoginError";
import AbstractHandler from "../abstract/AbstractHandler";


export default class DefaultVerificationMethodPrompt extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return !context.page.url().startsWith("https://accounts.google.com/signin/v2/challenge/selection") && !context.page.url().includes("/challenge/pwd") && context.page.url().includes("/challenge/"); 
	}
	async handle(context: RequestContext): Promise<LoginResponse> {
		const ok = await context.page.evaluate(() => {
			const buttons = document.querySelectorAll("button");
			const moreWaysToVerify = buttons[buttons.length - 1];
			if (moreWaysToVerify) {
				moreWaysToVerify.click();
				return true;
			} else {
				return false;
			}
		});

		if (ok) {
			return this.nextHandler(context);
		} else {
			throw await GoogleServiceErrorFactory.createUndefined(context, "Could not find element to default verification method prompt");
		}
	}

}