import RequestContext from "../RequestContext";
import { LoginResponse } from "../types/LoginResponse";
import AbstractHandler from "./abstract/AbstractHandler";

export default class Password extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/v3/signin/challenge/pwd");
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		await context.page.type("input[type=\"password\"]", context.request.password);
		await context.page.keyboard.press("Enter");
		return this.nextHandler(context);
	}
}