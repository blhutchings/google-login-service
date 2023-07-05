import { Solver } from "2captcha";
import * as OTPAuth from "otpauth";
import { PuppeteerLaunchOptions } from "puppeteer";
import GoogleLoginService from "./GoogleLoginService";
import { ActionHandlerRequest } from "./handlers/abstract/AbstractActionHandler";
import { NormalCaptchaResponse } from "./handlers/captcha/NormalCaptcha";
import { ReCaptchaResponse } from "./handlers/captcha/ReCaptcha";

async function main() {

	const solver = new Solver("");


	const secret = "";

	const totp = new OTPAuth.TOTP({
		label: "",
		algorithm: "SHA1",
		digits: 6,
		period: 30,
		secret: OTPAuth.Secret.fromBase32(secret)
	});


	const options: PuppeteerLaunchOptions = {
		executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
		headless: false,
		args: [
			"--incognito"
		]
	};

	const service = new GoogleLoginService({
		launchOptions: options
	});

	service.addActionHandler("totp", async (req: ActionHandlerRequest, data: undefined) => {
		return totp.generate();
	});

	service.addActionHandler("recaptcha", async (req: ActionHandlerRequest, data: ReCaptchaResponse) => {
		return (await solver.recaptcha(data.key, data.url, { "data-s": data.data_s })).data;
	});

	service.addActionHandler("normal-captcha", async (req: ActionHandlerRequest, data: NormalCaptchaResponse) => {
		return (await solver.imageCaptcha(data.img.data)).data;
	});


	for (let i = 0; i < 10; i++) {
		try {
			const session = await service.create({
				identifier: "",
				password: "",
			});
	
			const res = await session.start();
			res.cookies;
			console.log("OK");
		} catch (err) {
			console.log("Error");
			console.log(err);
		}
	}
}
main();
