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
// Used for solving captchas
const captchaSolver = new Solver("123");

// Used for generating time-based one-time passwords
const totpSecret = "123";
const totp = new OTPAuth.TOTP({
	label: "Account",
	algorithm: "SHA1",
	digits: 6,
	period: 30,
	secret: OTPAuth.Secret.fromBase32(totpSecret)
});

// Local Browser Options
const options: PuppeteerLaunchOptions = {
	executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
	headless: "new"
};

/* Remote Browser Options
const options: ConnectOptions = {
	browserWSEndpoint: "ws://localhost:3000"
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
	return (await captchaSolver.recaptcha(data.key, data.url, { "data-s": data.data_s })).data;
});

service.addActionHandler("normal-captcha", async (req: ActionHandlerRequest, data: NormalCaptchaResponse) => {
	return (await captchaSolver.imageCaptcha(data.img.data)).data;
});

try {
	const res = await service.login({
		identifier: "Account",
		password: "123ABC",
	});
	console.log(res.cookies);
} catch (err) {
	console.log(err);
}
```

## Documentation
### GoogleLoginServiceOptions
These are the options for the main service class which controls cookie reuse and the browser 
```ts
type GoogleLoginServiceOptions = {
	browserTimeout?: number;
	browserKeepAlive?: boolean;
	cookieStore?: ICookieStore;
	autoSignOut?: boolean;
	autoClose?: boolean;
	debug?: {

	}
} & ({
	browserType?: "local"
	launchOptions?: PuppeteerLaunchOptions,
} | {
	browserType?: "remote"
	launchOptions: ConnectOptions,
})
```
### `browserTimeout`
**Type: `number`**\
**Default: `30000`**\
Controls how long the browser will stay open in milliseconds after the last context closes.

### `browserKeepAlive`
**Type: `boolean`**\
**Default: `false`**\
Will use `browser.disconnect()` instead of `browser.close()`

### `cookieStore`
**Type: `ICookieStore`**\
**Default: `MemoryCookieStore`**\
Getter and setter class for reusing cookie sessions to reduce MFA attempts

### `autoSignOut`
**Type: `boolean`**\
**Default: `false`**\
If true, any successful login's will automatically be signed out and cookies invalidaded.

### `autoClose: boolean`
**Type: `boolean`**\
**Default: `true`**\
If true, context will not close on success or error

### `browserType`
**Type: `"local" | "remote"`**\
**Default: `local`**\
The source of the browser must be defined, with it either being a local browser or remote

### If `browserType = "local"` then `launchOptions`
**Type: [`PuppeteerLaunchOptions`](https://pptr.dev/api/puppeteer.puppeteerlaunchoptions)**\
Uses a local browser which must be specifided or is bundled with puppeteer

### If `browserType = "remote"` then `launchOptions`
**Type: [`ConnectOptions`](https://pptr.dev/api/puppeteer.connectoptions)**\
Uses a remote browser which must be connected through the network

### LoginRequest
```ts
type LoginRequest = {
    identifier: string,
    password: string,
    loadCookies?: boolean
	saveCookies?: boolean
}
```
### `identifier`
**Type: `string`**\
The identifier for the Google account, can either be an email or a phone number
#### **Note:**
> - If using a phone number, reRaptcha is used
> - If using a email address, NormalCaptcha is used
#### **Note:**
> - If '@' is omitted, Google will append @gmail.com
#### **Note:**
> - Use the international prefix to select country, if omitted Google will use the default of the browser
### `password`
**Type: `string`**\
The password used for the account
### `loadCookies`
**Type: `boolean`**\
**Default: `true`**\
If `loadCookies` is true, the cookies will be loaded into the browser context If false, the cookies will not be loaded
### `saveCookies`
**Type: `boolean`**\
**Default: `true`**\
If `saveCookies` is true, the cookies will be saved for reuse. If false, the cookies will not be saved/

## Supported Verification Methods
#### ✔️ Time-based one-time password (TOTP)

### Possible
#### ❌ Email verification
#### ❌ SMS verification 
#### ❌ Confirm recovery email

### Unlikely 
#### ❌ Google prompt
#### ❌ Passkey
#### ❌ Offline one-time password (OOTP)
#### ❌ Web verification
