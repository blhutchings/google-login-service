import RequestContext from "../../RequestContext";
import { ICookieStore } from "../../cookies/ICookieStore";
import { LoginResponse } from "../../types/LoginResponse";
import AbstractChainHandler from "../abstract/AbstractChainHandler";

export default class CookieStoreHandler extends AbstractChainHandler {
	private cookieStore: ICookieStore;

	constructor(cookieStore: ICookieStore) {
		super();
		this.cookieStore = cookieStore;
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		if (context.request.loadCookies === undefined) context.request.loadCookies = true;
		if (context.request.saveCookies === undefined) context.request.saveCookies = true;

		if (context.request.loadCookies) {
			const cookies = await this.cookieStore.get(context.request.identifier);
			if (cookies) {
				await context.page.setCookie(...cookies);
			}
		}
		
		const res = await this.nextHandler(context);

		if (context.request.saveCookies) {
			await this.cookieStore.set(context.request.identifier, res.cookies);
		}
		return res;
	}
}