import { Browser, BrowserContext, Page } from "puppeteer";

export default class SessionPage {
	static async init(context: Browser | BrowserContext): Promise<Page> {
		const page = await context.newPage();
		await page.setBypassCSP(true);
		await page.setRequestInterception(true);
        
		page.on("request", (request) => {
			if (["stylesheet", "font"].indexOf(request.resourceType()) !== -1) {
				request.abort();
			} else if (["image"].indexOf(request.resourceType()) !== -1) {
				if (request.url().startsWith("https://accounts.google.com/Captcha")) {
					request.continue();
				} else {
					request.abort();
				}
			} else {
				request.continue();
			}
		});
		return page;
	}

}