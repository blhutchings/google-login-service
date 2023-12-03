import { Browser, BrowserContext, Page } from "puppeteer";

export default class SessionPage {
	static async init(context: Browser | BrowserContext): Promise<Page> {
		const page = await context.newPage();
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36')
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