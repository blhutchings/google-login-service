import GoogleLoginService from "./GoogleServiceLogin";
import RequestContext from "./RequestContext";
import { NormalCaptchaResponse } from "./handlers/captcha/NormalCaptcha";
import { ReCaptchaResponse } from "./handlers/captcha/ReCaptcha";
import { Solver } from "2captcha";

async function main() {
	// Used for solving captchas

	// Used for generating time-based one-time passwords
	const service = new GoogleLoginService({
		browserType: "local",
		launchOptions: {
			headless: false,
		}
	});

	const solver = new Solver("");

	service.addActionHandler("recaptcha", async (req: RequestContext, data: ReCaptchaResponse) => {
		return (await solver.recaptcha(data.key, data.url, { "data-s": data.data_s })).data;
	});
	service.addActionHandler("normal-captcha", async (req: RequestContext, data: NormalCaptchaResponse) => {
		return (await solver.imageCaptcha(data.img.data)).data;
	});
	try {
		const res = await service.login({
			identifier: "",
			password: "",
			totpSecret: ""
		});
		console.log(res.cookies);
	} catch (err) {
		console.log(err);
	}

}
main();
