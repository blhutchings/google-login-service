import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceError } from "../../utils/LoginError";
import AbstractHandler from "./AbstractHandler";

export type ActionHandler = (req: ActionHandlerRequest, data?: any) => Promise<any>

export type ActionHandlerRequest = {
	identifier: string
}

export abstract class AbstractActionHandler<T extends ActionHandler> extends AbstractHandler {
	protected actionHandler?: T;

	hasActionHandler(): boolean {
		return (typeof this.actionHandler === "function");
	}

	addActionHandler(actionHandler: T) {
		this.actionHandler = actionHandler;
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		if (this.actionHandler) {
			const data = await this.handleActionSetup(context);

			const actionResponse = await this.actionHandler({
				identifier: context.request.identifier
			}, data);

			return this.handleActionResponse(context, actionResponse);
		} else {
			throw new GoogleServiceError("ActionHandler function is undefined");
		}
	}

	protected abstract handleActionSetup(context: RequestContext): Promise<unknown | undefined>;

	protected abstract handleActionResponse(context: RequestContext, data?: unknown): Promise<LoginResponse>;
}