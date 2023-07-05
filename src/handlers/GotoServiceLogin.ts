import RequestContext from "../RequestContext.js";
import { LoginResponse } from "../types/LoginResponse.js";
import AbstractHandler from "./abstract/AbstractHandler.js";


export default class GotoServiceLogin extends AbstractHandler {
	private signedInUrl: string;

	constructor(signedInUrl = "https://myaccount.google.com/") {
		super();
		this.signedInUrl = signedInUrl;
	}

	async canHandle(context: RequestContext): Promise<boolean> {
		return true;
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const page = context.page;

		await page.goto(`https://accounts.google.com/ServiceLogin?continue=${this.signedInUrl}`, {
			waitUntil: "networkidle0"
		});

		return this.nextHandler(context);
	}
}