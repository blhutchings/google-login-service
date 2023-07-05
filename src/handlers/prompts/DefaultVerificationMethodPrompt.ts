import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError";
import AbstractHandler from "../abstract/AbstractHandler";


export default class DefaultVerificationMethodPrompt extends AbstractHandler{
	async canHandle(context: RequestContext): Promise<boolean> {
		return !context.page.url().startsWith("https://accounts.google.com/signin/v2/challenge/selection") && context.page.url().includes("/challenge/") && !context.page.url().includes("/challenge/pwd");
	}
	async handle(context: RequestContext): Promise<LoginResponse> {
		const buttons = await context.page.$$("button");

		const moreWaysToVerify = buttons[buttons.length - 1];
		if (moreWaysToVerify) {
			moreWaysToVerify.click();
			return this.nextHandler(context);
		} else {
			throw await GoogleServiceLoginErrorFactory.createUndefined(context,"Could not find element to default verification method prompt");
		}
	}

}