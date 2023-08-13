import RequestContext from "../../RequestContext.js";
import { LoginErrorStatus } from "../../types/LoginErrorStatus.js";
import { LoginResponse } from "../../types/LoginResponse.js";
import { GoogleServiceErrorFactory } from "../../utils/LoginError.js";
import AbstractHandler from "../abstract/AbstractHandler.js";

export default class InvalidEndpoint extends AbstractHandler {
	async canHandle(context: RequestContext): Promise<boolean> {
		return Boolean(await context.page.$("main#af-error-container"));
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const page = context.page;

		const errorElement = await page.$("main#af-error-container");
		if (errorElement) {
			const errorMessage = await page.evaluate(() => {
				const errorMessageText = document.querySelector("main#af-error-container > p:nth-child(3)")?.childNodes[0]?.textContent;
				return errorMessageText ? errorMessageText : "Could not select error message.";
			});

			throw GoogleServiceErrorFactory.create(context, LoginErrorStatus.GOOGLE_API, errorMessage);
		}

		throw await GoogleServiceErrorFactory.createUndefined(context, "Could not select error container");
	}
}