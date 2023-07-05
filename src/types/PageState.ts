import { Page } from "puppeteer";

export class PageState {
	url: URL;
	html: string;
	screenshot: Buffer;
	constructor(url: URL, html: string, screenshot: Buffer) {
		this.url = url;
		this.html = html;
		this.screenshot = screenshot;
	}

	static async create(page: Page) {
		const url = new URL(page.url());
		const screenshot = await page.screenshot();
		const html: string = await page.evaluate(() => {
			const node = document.doctype;
			const htmlDoctype = node ? "<!DOCTYPE "
                + node.name
                + (node.publicId ? " PUBLIC \"" + node.publicId + "\"" : "")
                + (!node.publicId && node.systemId ? " SYSTEM" : "")
                + (node.systemId ? " \"" + node.systemId + "\"" : "")
                + ">" : "";
			return htmlDoctype + document.documentElement.outerHTML;
		});
		return new PageState(url, html, screenshot);
	}
}
