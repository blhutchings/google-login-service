import { PuppeteerLaunchOptions, PuppeteerNode } from "puppeteer";
import { PuppeteerExtra } from "puppeteer-extra";
import { AbstractBrowserController } from "./AbstractBrowserController";


export default class LocalBrowserController extends AbstractBrowserController {
	protected options: PuppeteerLaunchOptions;

	constructor(puppeteer: PuppeteerExtra | PuppeteerNode, options: PuppeteerLaunchOptions, timeout: number, keepAlive: boolean) {
		super(puppeteer, timeout, keepAlive);
		this.options = options;
	}

	protected createBrowser() {
		return this.puppeteer.launch(this.options);
	}

}