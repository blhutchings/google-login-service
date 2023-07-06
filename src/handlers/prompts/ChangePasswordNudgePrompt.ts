import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError";
import AbstractHandler from "../abstract/AbstractHandler";


export default class ChangePasswordNudgePrompt extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/signin/v2/speedbump/changepassword/changepasswordnudge");
	}
    
	async handle(context: RequestContext): Promise<LoginResponse> {
		const ok = await context.page.evaluate(() => {
			const nextButton =  document.querySelector("button");
			if (nextButton) {
				nextButton.click();
				return true;
			} else {
				return false;
			}
		});	
		if (ok) {
			return this.nextHandler(context);
		} else {
			throw await GoogleServiceLoginErrorFactory.createUndefined(context,"Could not find element to advance change password nudge prompt");
		}
	}
}