import { ElementHandle } from "puppeteer";
import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceError, GoogleServiceErrorFactory } from "../../utils/LoginError";
import { ActionHandler } from "../abstract/AbstractActionHandler";
import AbstractHandler from "../abstract/AbstractHandler";
import AbstractVerificationHandler from "../abstract/AbstractVerificationHandler";

export default class SelectVerification extends AbstractHandler {
	private verificationHandlers: Map<number, AbstractVerificationHandler<ActionHandler>> = new Map();

	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/signin/v2/challenge/selection") || 
				context.page.url().startsWith("https://accounts.google.com/v3/signin/challenge/selection");
	}

	addHandler(handler: AbstractVerificationHandler<ActionHandler>) {

		
		this.verificationHandlers.set(handler.type, handler);
		return this;
	}

	async handle(context: RequestContext): Promise<LoginResponse> {
		const challengeElements = await context.page.$$("div[data-challengetype]:not([data-challengetype='null'],[data-challengeunavailable='true'],[data-accountrecovery='true'])");
		//const challengeElements = await context.page.$$("div[data-challengetype]:not([data-challengetype='null'][data-challengeunavailable='true'])");

		const challengeMap = new Map<number, ElementHandle<HTMLDivElement>>();

		await Promise.all(challengeElements.map(async (element) => {
			const type = await element.evaluate((el) => {
				return Number(el.getAttribute("data-challengetype"));
			});
			if (isNaN(type)) throw new GoogleServiceError("data-challengetype is NaN");
			challengeMap.set(type, element);
		}));

		for (const [type, element] of challengeMap) {
			const verificationHandler = this.verificationHandlers.get(type);
			if (verificationHandler && verificationHandler.hasActionHandler()) {
				await element.click();
				return this.nextVerificationHandler(context, verificationHandler);
			}
		}

		const message = challengeElements.map((el) => {
			el.getProperty("innerText");
		}).join("\n");


		throw GoogleServiceErrorFactory.create(context, LoginErrorStatus.NO_SUPPORTED_VERIFICATION, message);
	}

	protected nextHandler(context: RequestContext): Promise<LoginResponse> {
		throw Error("Bad use - nextVerificationHandler");
	}

	protected async nextVerificationHandler(context: RequestContext, verificationHandler: AbstractVerificationHandler<ActionHandler>): Promise<LoginResponse> {
		do {
			await context.page.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 });
		} while (await context.page.$("div#initialView[aria-busy=\"true\""));

		return await verificationHandler.handle(context);
	}
}