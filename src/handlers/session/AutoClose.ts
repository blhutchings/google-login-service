import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import AbstractChainHandler from "../abstract/AbstractChainHandler";

export default class AutoClose extends AbstractChainHandler {
	private enabled: boolean;
	constructor(enabled: boolean) {
		super();
		this.enabled = enabled;
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		try {
			const res = await this.nextHandler(context);
			if (this.enabled) {
				context.close();
				res.context = undefined;
			}
			return res;
		} catch (err) {
			// Close even if there is an error
			if (this.enabled) {
				context.close();
			}
			throw err;
		}
	}
}