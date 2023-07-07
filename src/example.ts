//import puppeteer from "puppeteer";
import { Solver } from "2captcha";
import * as OTPAuth from "otpauth";
import GoogleServiceLogin from "./GoogleServiceLogin";
//import RemoteBrowserController from "./browser/RemoteBrowserController";
import { ActionHandlerRequest } from "./handlers/abstract/AbstractActionHandler";
import { NormalCaptchaResponse } from "./handlers/captcha/NormalCaptcha";
import { ReCaptchaResponse } from "./handlers/captcha/ReCaptcha";

async function main() {


	const solver = new Solver("123");

	const secret = "123";

	const totp = new OTPAuth.TOTP({
		label: "Account",
		algorithm: "SHA1",
		digits: 6,
		period: 30,
		secret: OTPAuth.Secret.fromBase32(secret)
	});


	// Local Options
	const options = {
		executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
		headless: false
	};
	

	
	/* Remote Options
	const options = {
		browserWSEndpoint: ""
	};
	*/
	
	

	const service = new GoogleServiceLogin({
		browserType: "local",
		launchOptions: options,
		browserTimeout: 0
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


	try {
		const res = await service.login({
			identifier: "Account",
			password: "123ABC",
		});

		console.log("OK");
		console.log(res.cookies);
	} catch (err) {
		console.log("Error");
		console.log(err);
	}

}
main();
