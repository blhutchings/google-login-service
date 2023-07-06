

import { ConnectOptions, PuppeteerNode } from "puppeteer";
import { PuppeteerExtra } from "puppeteer-extra";
import { AbstractBrowserController } from "./AbstractBrowserController";

export default class RemoteBrowserController extends AbstractBrowserController {
	protected options: ConnectOptions;

	constructor(puppeteer: PuppeteerExtra | PuppeteerNode, options: ConnectOptions, timeout: number, keepAlive: boolean) {
		super(puppeteer, timeout, keepAlive);
		this.options = options;
	}

	protected createBrowser() {
		return this.puppeteer.connect(this.options);
	}

	
}