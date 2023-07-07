import { Browser, BrowserContext, ConnectOptions, PuppeteerNode, PuppeteerNodeLaunchOptions } from "puppeteer";
import { GoogleServiceError } from "../utils/LoginError";
import { PuppeteerExtra } from "puppeteer-extra";


export abstract class AbstractBrowserController {
	protected puppeteer: PuppeteerExtra | PuppeteerNode;
	protected abstract options?: PuppeteerNodeLaunchOptions | ConnectOptions;
	private browser?: Browser;
	private openContexts: Map<string, BrowserContext> = new Map();
	private timeoutRef?: NodeJS.Timeout;
	private timeout: number;
	private keepAlive: boolean;

	constructor(puppeteer: PuppeteerExtra | PuppeteerNode, timeout: number, keepAlive: boolean) {
		this.puppeteer = puppeteer;
		this.timeout = timeout;
		this.keepAlive = keepAlive;
	}

	protected abstract createBrowser(): Promise<Browser>;

	async createLoginBrowserContext(): Promise<BrowserContext> {
		if (this.browser === undefined) this.browser = await this.createBrowser();
		const context = await this.browser.createIncognitoBrowserContext();

		if (context.id) {
			this.openContexts.set(context.id, context);

			if (this.timeoutRef) {
				clearTimeout(this.timeoutRef);
				this.timeoutRef = undefined;
			}

			context.once("close", (id: string | undefined) => {
				// Close the real context
				if (id) {
					this.openContexts.delete(id);

					// If no open contexts, start timeout to close browser instance
					if (this.openContexts.size === 0) {
						this.timeoutRef = setTimeout(() => {
							if (this.browser) {
								if (this.keepAlive) {
									if (this.browser.isConnected()) {
										this.browser.disconnect();
									}
								} else {
									this.browser.close();
								}
								this.browser = undefined;
							}
						}, this.timeout);

					}
				} else {
					throw new GoogleServiceError("Trying to close BrowserContext with undefined id");
				}
			});
			return context;
		}
		throw new GoogleServiceError("BrowserContext id is undefined");
	}
}