import RequestContext from "../../RequestContext";
import { GoogleServiceError } from "../../utils/LoginError";
import AbstractHandler from "./AbstractHandler";

export default abstract class AbstractChainHandler extends AbstractHandler {
    
	async canHandle(context: RequestContext): Promise<boolean> {
		return true;
	}

	addHandler(handler: AbstractHandler): this {
		if (this.handlers.length > 1) throw new GoogleServiceError("Tried adding more than one handler to ChainHandler");
		this.handlers[0] = handler;
		return this;
	}
}