## A Google Service Login Automation
The purpose of this service is to produce cookies of freshly authenticated google account.

Currently only TOTP works reliably.

This will work unrelably for accounts with only a password as they may be prompted to verify with <b>any</b> phone number.
This makes it challenging to automate as Google will not send OTP to phone api providers (Twillio). Might have plans to email verification, but TOTP works well enough for now.


## Install
```sh
npm install google-login-service
```

## TOTP Notes
* The requested account must have 2FA enabled with TOTP enabled.
* Write down the secret from the QR code
* A useful package for generating the tokens with the secret - https://github.com/hectorm/otpauth

## Example Usage
```ts
const options: PuppeteerLaunchOptions = {
		executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
		headless: "new",
		args: [
			"--incognito"
		]
	};

// Create the service
const service = new GoogleLoginService({
	launchOptions: options
});

// Create TOTP token generator
const secret = "ABC";

const totp = new OTPAuth.TOTP({
	label: "My Account",
	algorithm: "SHA1",
	digits: 6,
	period: 30,
	secret: OTPAuth.Secret.fromBase32(secret)
});

// Add handler functions with respect to the external input needed
// Generating TOTP token for account
service.addActionHandler("totp", async (req: ActionHandlerRequest, data: undefined) => {
	return totp.generate();
});

// Solving captchas
service.addActionHandler("recaptcha", async (req: ActionHandlerRequest, data: ReCaptchaResponse) => {
	return (await solver.recaptcha(data.key, data.url, { "data-s": data.data_s })).data;
});
service.addActionHandler("normal-captcha", async (req: ActionHandlerRequest, data: NormalCaptchaResponse) => {
	return (await solver.imageCaptcha(data.img.data)).data;
});

// Try a couple of time, something is bound to go wrong internally :) 
// Once cookies have been set once, the session will be reused/refreshed on every get
for (let i = 0; i < 10; i++) {
	try {
		// Send the request
		const session = await service.create({
			identifier: "ABC",
			password: "123",
		});

		// If successful, take your cookies
		const res = await session.start();
		console.log(res.cookies);
	} catch (err) {
		console.log(err);
	}
}
```

## Supported Verification Methods
#### ✔️ Time-based one-time password (TOTP)

### Possible
#### ❌ Email verification
#### ❌ SMS verification 
#### ❌ Confirm recovery email

### Never - Requires a human
#### ❌ Google prompt
#### ❌ Passkey
#### ❌ Offline one-time password (OOTP)
#### ❌ Web verification