import RequestContext from "../RequestContext";
import { LoginResponse } from "../types/LoginResponse";
import AbstractHandler from "./abstract/AbstractHandler";


export default class LoggedIn extends AbstractHandler {
	private signedInUrl: string;

	constructor(signedInUrl = "https://myaccount.google.com/") {
		super();
		this.signedInUrl = signedInUrl;
	}

	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith(this.signedInUrl);
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const allContextCookies = (await context.cdpSession.send("Network.getAllCookies")).cookies;

		await context.page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });

		return new LoginResponse("Context Logged in", context.request, allContextCookies);
	}
}