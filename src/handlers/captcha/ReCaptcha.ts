import { Page } from "puppeteer";
import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { ActionHandlerRequest, AbstractActionHandler } from "../abstract/AbstractActionHandler";
import { GoogleServiceErrorFactory } from "../../utils/LoginError";


export type ReCaptchaResponse = {
    url: string,
    key: string,
    data_s: string
}

export type ReCaptchaActionHandler = (req: ActionHandlerRequest, captcha: ReCaptchaResponse) => Promise<string | undefined>

export default class ReCaptcha extends AbstractActionHandler<ReCaptchaActionHandler> {
	async canHandle(context: RequestContext): Promise<boolean> {
		return context.page.url().startsWith("https://accounts.google.com/signin/v2/challenge/recaptcha");
	}

	protected async handleActionSetup(context: RequestContext): Promise<ReCaptchaResponse> {
		const displaySet = await context.page.evaluate(() => {
			const displayElement = document.querySelector<HTMLTextAreaElement>("textarea#g-recaptcha-response");
			if (displayElement) {
				displayElement.style.display = "";
				return true;
			} else {
				return false;
			}
		});

		if (!displaySet) {
			throw await GoogleServiceErrorFactory.createUndefined(context, "Could not find 'textarea#g-recaptcha-response'");
		}

		const url = context.page.url();

		const recaptchaElement = await context.page.evaluate(() => document.getElementById("recaptcha"));
		const key = recaptchaElement?.getAttribute("data-sitekey");
		const data_s = recaptchaElement?.getAttribute("data-s");

		if (key && data_s) {
			const captcha: ReCaptchaResponse = {
				url: url,
				key: key,
				data_s: data_s
			};

			return captcha;
            
		} else {
			throw await GoogleServiceErrorFactory.createUndefined(context, `Could not find a reCAPTCHA part - key:${key} data-s:${data_s}`);
		}
	}
	protected async handleActionResponse(context: RequestContext, token?: string): Promise<LoginResponse> {
		if (!token) throw GoogleServiceErrorFactory.create(context, LoginErrorStatus.INVALID_REQUEST, "ReCaptcha response token is empty");

		const submitButton = await this.getSubmitButton(context.page);
		if (!submitButton) throw GoogleServiceErrorFactory.createUndefined(context, "Could not create or find recaptcha submit button");
        
		await context.page.evaluate(() => {
			let innerHTML = document.getElementById("g-recaptcha-response")?.innerHTML;
			if (innerHTML) {
				innerHTML = token;
			}
		});

		submitButton.click();

		return this.nextHandler(context);
	}


	private async getSubmitButton(page: Page): Promise<HTMLButtonElement | null> {
		let submitButton = await page.evaluate(() => {
			return document.querySelector<HTMLButtonElement>("button#myRecaptchaSubmit");
		});

		if (!submitButton) {
			submitButton = await page.evaluate(() => {
				const button = document.createElement("button");
				button.innerHTML = "Submit";
				button.type = "submit";
				button.id = "myRecaptchaSubmit";
				return button;
			});

			const form = await page.evaluate(() => document.querySelector<HTMLFormElement>("form#captcha-form"));
			if (form && submitButton) {
				form.appendChild(submitButton);
			}
		}
		return submitButton;
	}
}