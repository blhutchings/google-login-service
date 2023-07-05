import RequestContext from "../../RequestContext";
import ICookieStore from "../../cookies/ICookieStore";
import { LoginResponse } from "../../types/LoginResponse";
import AbstractChainHandler from "../abstract/AbstractChainHandler";

export default class CookieLoader extends AbstractChainHandler {
	private cookieStore: ICookieStore;

	constructor(cookieStore: ICookieStore) {
		super();
		this.cookieStore = cookieStore;
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		if (context.request.unique === undefined) context.request.unique = false;

		if (context.request.unique) {
			return await this.nextHandler(context);
		} else {
			const cookies = await this.cookieStore.get(context.request.identifier);
			if (cookies) {
				await context.page.setCookie(...cookies);
			}
			const res = await this.nextHandler(context);
			await this.cookieStore.set(context.request.identifier, res.cookies);
			return res;
		}
	}
}