import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError.js";
import AbstractHandler from "../abstract/AbstractHandler";

export default class InvalidRequest extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return Boolean(await context.page.$("input[aria-invalid=\"true\"]"));
	}
	async handle(context: RequestContext): Promise<LoginResponse> {
		const message = await context.page.evaluate(() => {
			return String(document.querySelector("input[aria-invalid=\"true\"]")?.closest("section")?.querySelector("svg")?.parentNode?.parentNode?.textContent);
		});
		throw GoogleServiceLoginErrorFactory.create(LoginErrorStatus.INVALID_REQUEST, message);
	}
}