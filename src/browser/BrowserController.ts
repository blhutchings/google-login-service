import { PuppeteerLaunchOptions, Browser, BrowserContext } from "puppeteer";
import { PuppeteerExtra } from "puppeteer-extra";
import { GoogleServiceError } from "../utils/LoginError";


export default class BrowserController {
	private puppeteer: PuppeteerExtra;
	private options?: PuppeteerLaunchOptions;
	private browser?: Browser;

	private timeout: number;
	private timeoutHandler?: NodeJS.Timeout;
	private openContexts: Map<string, BrowserContext> = new Map();

	/**
	 * 
	 * @param puppeteer Puppeteer instance reference
	 * @param options Puppeteer lauch options
	 * @param timeout How long the browser will stay open after last context closes - Default (15 minutes/90000 milliseconds)
	 */
	constructor(puppeteer: PuppeteerExtra, options?: PuppeteerLaunchOptions, timeout = 900000) {
		this.puppeteer = puppeteer;
		this.options = options;
		this.timeout = timeout;
	}

	async createLoginBrowserContext(): Promise<BrowserContext> {
		if (this.browser === undefined) this.browser = await this.puppeteer.launch(this.options);
		const context = await this.browser.createIncognitoBrowserContext();

		if (context.id) {
			this.openContexts.set(context.id, context);

			if (this.timeoutHandler) {
				clearTimeout(this.timeoutHandler);
				this.timeoutHandler = undefined;
			}

			context.once("close", (id: string | undefined) => {
				
				// Close the real context
				if (id) {
					const context = this.openContexts.get(id);
					this.openContexts.delete(id);
					context?.close();
					this.startTimeout();
				}
			});
			return context;
		}
		throw new GoogleServiceError("BrowserContext id is undefined");
	}

	private startTimeout() {
		if (this.openContexts.size === 0) {
			this.timeoutHandler = setTimeout(() => {
				if (this.openContexts.size === 0) {
					this.browser?.close().then(() => {
						if (this.openContexts.size === 0) {
							this.browser = undefined;
						}
					});
				} else {
					this.timeoutHandler;
				}
			}, this.timeout);
		}

	}

}