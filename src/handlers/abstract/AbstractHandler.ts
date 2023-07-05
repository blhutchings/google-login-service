import { TimeoutError } from "puppeteer";
import RequestContext from "../../RequestContext";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";

export default abstract class AbstractHandler {
	protected static globalHandlers: AbstractHandler[] = [];
	protected handlers: AbstractHandler[] = [];

	static addGlobalHandler(...handlers: (AbstractHandler | AbstractHandler[])[]) {
		handlers.forEach(handler => AbstractHandler.globalHandlers = AbstractHandler.globalHandlers.concat(handler));
		return this;
	}

	addHandler(...handlers: (AbstractHandler | AbstractHandler[])[]) {
		handlers.forEach(handler => this.handlers = this.handlers.concat(handler));
		return this;
	}

	clearHandlers() {
		this.handlers = [];
	}

	private async findFirstValidHandler(context: RequestContext): Promise<AbstractHandler | undefined> {
		const globalHandlersPromises = AbstractHandler.globalHandlers.map(async (h) => {
			return await h.canHandle(context);
		});

		const handlersPromises = this.handlers.map(async (h) => {
			return await h.canHandle(context);
		});
		const results = await Promise.all(globalHandlersPromises.concat(handlersPromises));
		const index = results.findIndex(result => result);
		if (index < AbstractHandler.globalHandlers.length) {
			return AbstractHandler.globalHandlers[index];
		} else {
			return this.handlers[index - AbstractHandler.globalHandlers.length];
		}
	}

	/**
	 * @returns If there is manually assigned next handler, ignores globals
	 */
	hasNextHandler(): boolean {
		return this.handlers.length > 0;
	}

	protected async nextHandler(context: RequestContext): Promise<LoginResponse> {
		try {
			do {
				await context.page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
			} while (await context.page.$("div#initialView[aria-busy='true'"));

			const handler = await this.findFirstValidHandler(context);
			if (handler) {
				return await handler.handle(context);
			} else {
				throw GoogleServiceLoginErrorFactory.create(LoginErrorStatus.UNHANDABLE, "No handler can handle current state");
			}

		} catch (err: unknown) {
			if (err instanceof TimeoutError) {
				const handler = await this.findFirstValidHandler(context);
				if (handler) return await handler.handle(context);
			}
            
			throw err;
		}
	}

    abstract canHandle(context: RequestContext): Promise<boolean>;
    abstract handle(context: RequestContext): Promise<LoginResponse>;
}

