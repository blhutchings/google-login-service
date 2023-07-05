import RequestContext from "../RequestContext";
import { LoginResponse } from "../types/LoginResponse";
import AbstractHandler from "./abstract/AbstractHandler";


export default class Identifier extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/v3/signin/identifier");
	}
    
	async handle(context: RequestContext): Promise<LoginResponse> {
		await context.page.waitForSelector("input[type=\"email\"]", { visible: true });
		await context.page.type("input[type=\"email\"]", context.request.identifier);
		await context.page.keyboard.press("Enter");

		return this.nextHandler(context);
	}
}

