import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import AbstractChainHandler from "../abstract/AbstractChainHandler";

export default class AutoSignOut extends AbstractChainHandler {
	private enabled: boolean;
	constructor(enabled: boolean) {
		super();
		this.enabled = enabled;
	}


	async handle(context: RequestContext): Promise<LoginResponse> {
		const res = await this.nextHandler(context);

		if (this.enabled && context.page.url().startsWith("https://myaccount.google.com/")) {
			await context.page.goto("https://accounts.google.com/Logout", {
				waitUntil: "networkidle0"
			});
		}

		return res;
	}

}