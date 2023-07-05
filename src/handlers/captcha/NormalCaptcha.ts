import RequestContext from "../../RequestContext";
import { LoginErrorStatus } from "../../types/LoginErrorStatus";
import { LoginResponse } from "../../types/LoginResponse";
import { GoogleServiceLoginErrorFactory } from "../../utils/LoginError";
import { ActionHandlerRequest, AbstractActionHandler } from "../abstract/AbstractActionHandler";


export type NormalCaptchaResponse = {
    img: {
        src: string,
        data: string
    },
    audio: {
        src: string,
        data: string
    }
}

export type NormalCaptchaActionHandler = (req: ActionHandlerRequest, captcha: NormalCaptchaResponse) => Promise<string>

export default class NormalCaptcha extends AbstractActionHandler<NormalCaptchaActionHandler> {
	async canHandle(context: RequestContext): Promise<boolean> {
		const imgCaptchaElement = await context.page.$("img#captchaimg[src]");
		const audioCaptchaElement = await context.page.$("audio#captchaAudio[src]");
		return Boolean(imgCaptchaElement) || Boolean(audioCaptchaElement);
	}

	protected async handleActionSetup(context: RequestContext): Promise<NormalCaptchaResponse> {
		const imgSrc = await context.page.evaluate(() => {
			return document.querySelector<HTMLImageElement>("img#captchaimg[src]")?.src;
		});
		const audioSrc = await context.page.evaluate(() => {
			return document.querySelector<HTMLAudioElement>("audio#captchaAudio[src]")?.src;
		});

		if (imgSrc && audioSrc) {
			const [imgRes, audioRes] = await Promise.all([
				fetch(imgSrc),
				fetch(audioSrc)
			]);

			const imgData = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
			const audioData = Buffer.from(await audioRes.arrayBuffer()).toString("base64");

			const captcha: NormalCaptchaResponse = {
				img: {
					src: imgSrc,
					data: imgData
				},
				audio: {
					src: audioSrc,
					data: audioData
				}
			};

			if (imgSrc && imgRes && audioSrc && audioRes) {
				return captcha;
			}
		}
		throw await GoogleServiceLoginErrorFactory.createUndefined(context, "Could not find captcha sources");
	}

	protected async handleActionResponse(context: RequestContext, token?: string): Promise<LoginResponse> {
		if (!token) throw GoogleServiceLoginErrorFactory.create(LoginErrorStatus.INVALID_REQUEST, "Normal Captcha response token is empty");

		const page = context.page;
		await page.waitForSelector("input#ca");
		await page.type("input#ca", token);
		await page.keyboard.press("Enter");

		return this.nextHandler(context);
	}
}