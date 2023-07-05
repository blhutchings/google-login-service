import { EventEmitter, Page, BrowserContext, CDPSession } from "puppeteer";
import { LoginRequest } from "./types/LoginRequest";
export default class RequestContext extends EventEmitter {
	private closed = false;
	request: LoginRequest;
	browserContext: BrowserContext;
	page: Page;
	cdpSession: CDPSession;

	constructor(request: LoginRequest, browserContext: BrowserContext, page: Page, cdpSession: CDPSession) {
		super();

		this.request = request;
		this.browserContext = browserContext;
		this.page = page;
		this.cdpSession = cdpSession;
	} 

	isClosed() {
		return this.closed;
	}

	close() {
		this.closed = true;
		this.browserContext.emit("close", this.browserContext.id);
	}
}