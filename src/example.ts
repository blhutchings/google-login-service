import { Solver } from "2captcha";
import * as OTPAuth from "otpauth";
import GoogleLoginService from "./GoogleServiceLogin";
import { ActionHandlerRequest } from "./handlers/abstract/AbstractActionHandler";
import { NormalCaptchaResponse } from "./handlers/captcha/NormalCaptcha";
import { ReCaptchaResponse } from "./handlers/captcha/ReCaptcha";
import { PuppeteerLaunchOptions } from "puppeteer";

async function main() {
	// Used for solving captchas
	const captchaSolver = new Solver("11b3097fe0620319ae70167c4c507ed1");

	// Used for generating time-based one-time passwords
	const totpSecret = "kztlu6ckv57bxzy2k6iwsf4gqhyctns6";
	const totp = new OTPAuth.TOTP({
		label: "Account",
		algorithm: "SHA1",
		digits: 6,
		period: 30,
		secret: OTPAuth.Secret.fromBase32(totpSecret)
	});

	// Local Browser Options
	const options: PuppeteerLaunchOptions = {
		headless: false
	};

	/* Remote Browser Options
	const options: ConnectOptions = {
		browserWSEndpoint: "ws://localhost:3000"
	};
	*/

	const service = new GoogleLoginService({
		browserType: "local",
		launchOptions: options,
		browserTimeout: 0
	});

	service.addActionHandler("totp", async (req: ActionHandlerRequest, data: undefined) => {
		return totp.generate();
	});

	service.addActionHandler("recaptcha", async (req: ActionHandlerRequest, data: ReCaptchaResponse) => {
		return (await captchaSolver.recaptcha(data.key, data.url, { "data-s": data.data_s })).data;
	});

	service.addActionHandler("normal-captcha", async (req: ActionHandlerRequest, data: NormalCaptchaResponse) => {
		return (await captchaSolver.imageCaptcha(data.img.data)).data;
	});

	try {
		const res = await service.login({
			identifier: "ytgdb0@gmail.com",
			password: "rm3WLM0zIs7924XkBxp$pObC6*Q4g&6x1",
		});
		console.log(res.cookies);
	} catch (err) {
		console.log(err);
	}

}
main();
