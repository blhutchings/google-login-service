import { PuppeteerLaunchOptions } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import RequestContext from "./RequestContext";
import BrowserController from "./browser/BrowserController";
import ICookieStore from "./cookies/ICookieStore";
import MemoryCookieStore from "./cookies/MemoryCookieStore";
import GotoServiceLogin from "./handlers/GotoServiceLogin";
import Identifier from "./handlers/Identifier";
import LoggedIn from "./handlers/LoggedIn";
import Password from "./handlers/Password";
import { ActionHandler } from "./handlers/abstract/AbstractActionHandler";
import AbstractHandler from "./handlers/abstract/AbstractHandler";
import NormalCaptcha, { NormalCaptchaActionHandler } from "./handlers/captcha/NormalCaptcha";
import ReCaptcha, { ReCaptchaActionHandler } from "./handlers/captcha/ReCaptcha";
import ChangePassword from "./handlers/errors/ChangePassword";
import DeniedSignInRejected from "./handlers/errors/DeniedSignInRejected";
import InvalidEndpoint from "./handlers/errors/InvalidEndpoint";
import InvalidRequest from "./handlers/errors/InvalidRequest";
import Rejected from "./handlers/errors/Rejected";
import SessionExpired from "./handlers/errors/SessionExpired";
import UnknownError from "./handlers/errors/UnknownError";
import AdditionalSecurityPrompt from "./handlers/prompts/AdditionalSecurity";
import ChangePasswordNudgePrompt from "./handlers/prompts/ChangePasswordNudgePrompt";
import DefaultVerificationMethodPrompt from "./handlers/prompts/DefaultVerificationMethodPrompt";
import AutoClose from "./handlers/session/AutoClose";
import CookieLoader from "./handlers/session/CookierLoader";
import SelectVerification from "./handlers/verification/SelectVerification";
import TOTPVerification, { TOTPActionHandler } from "./handlers/verification/TOTPVerification";
import { LoginRequest } from "./types/LoginRequest";
import SessionPage from "./utils/SessionPage";
import RequestSession from "./RequestSession";
import RetryHandler from "./handlers/session/ResumeHandler";
import AutoSignOut from "./handlers/session/AutoSignOut";


export type GoogleLoginServiceOptions = {
    launchOptions?: PuppeteerLaunchOptions,
    browserController?: BrowserController,
    cookieStore?: ICookieStore;
	debug?: {
		autoSignOut?: boolean;
		autoClose?: boolean;
	}
}

export default class GoogleServiceLogin {
	private puppeteer = puppeteer;
	private options: Required<GoogleLoginServiceOptions>;

	private startHandler: AbstractHandler;
	private retry: RetryHandler;

	// Action Handlers
	private recaptcha: ReCaptcha;
	private normalCaptcha: NormalCaptcha;
	private totp: TOTPVerification;

	constructor(options: GoogleLoginServiceOptions = {}) {
		const stealth = StealthPlugin();
		stealth.enabledEvasions.delete("iframe.contentWindow");
		stealth.enabledEvasions.delete("navigator.plugins");
		this.puppeteer.use(stealth);

		const debugOptions = {
			autoSignOut: options.debug?.autoSignOut ?? false,
			autoClose: options.debug?.autoClose ?? true
		};

		this.options = {
			launchOptions: options.launchOptions ?? {},
			browserController: options.browserController ?? new BrowserController(this.puppeteer, options.launchOptions, 90000),
			cookieStore: options.cookieStore ?? new MemoryCookieStore(),
			debug: debugOptions
		};

		// Global Errors 
		const changePassword = new ChangePassword();
		const deniedSignInRejected = new DeniedSignInRejected();
		const invalidEndpoint = new InvalidEndpoint();
		const invalidRequest = new InvalidRequest();
		const rejected = new Rejected();
		const sessionExpired = new SessionExpired();
		const unknownError = new UnknownError();
		const errors = [changePassword, deniedSignInRejected, invalidEndpoint, invalidRequest, rejected, sessionExpired, unknownError];
		AbstractHandler.addGlobalHandler(errors);

		// Core
		const gotoServiceLogin = new GotoServiceLogin();
		const identifier = new Identifier();
		const password = new Password();
		const loggedIn = new LoggedIn();

		// Captchas
		this.normalCaptcha = new NormalCaptcha();
		this.recaptcha = new ReCaptcha();
		const captchas = [this.normalCaptcha, this.recaptcha];

		// Prompts
		const additionalSecurityPrompt = new AdditionalSecurityPrompt();
		const changePasswordNudge = new ChangePasswordNudgePrompt();
		const defaultVerificationMethodPrompt = new DefaultVerificationMethodPrompt();
		const prompts = [defaultVerificationMethodPrompt, additionalSecurityPrompt, changePasswordNudge];

		// Verification
		const selectVerification = new SelectVerification();
		this.totp = new TOTPVerification();
		const verificationMethods = [this.totp];

		// Session Management
		this.retry = new RetryHandler();
		const cookieLoader = new CookieLoader(this.options.cookieStore);
		const autoCloseContextInitial = new AutoClose(debugOptions.autoClose);
		const autoSignOutInitial = new AutoSignOut(debugOptions.autoSignOut);
		const autoCloseContextRetry = new AutoClose(debugOptions.autoClose);
		const autoSignOutRetry = new AutoSignOut(debugOptions.autoSignOut);

		// ================================================ //
		// 						 Setup						//
		// ================================================ //

		// Entry Points
		this.startHandler = autoCloseContextInitial;
		this.retry = autoCloseContextRetry;

		// Session Management
		autoCloseContextInitial.addHandler(autoSignOutInitial); // Close Context must be first (execute last)
		autoSignOutInitial.addHandler(cookieLoader);

		autoCloseContextRetry.addHandler(autoSignOutRetry);
		autoSignOutRetry.addHandler(this.retry);


		this.retry.addHandler([identifier, password, loggedIn], captchas, prompts, verificationMethods);
		cookieLoader.addHandler(gotoServiceLogin);


		// Core
		gotoServiceLogin.addHandler(loggedIn, identifier);
		identifier.addHandler(password, captchas);
		password.addHandler(loggedIn, selectVerification, prompts, verificationMethods);

		// Prompts
		additionalSecurityPrompt.addHandler(loggedIn);
		changePasswordNudge.addHandler(loggedIn);
		defaultVerificationMethodPrompt.addHandler(selectVerification);

		// Verification
		selectVerification.addHandler(this.totp);
		this.totp.addHandler(loggedIn, prompts);
	}

	addActionHandler(name: "totp", handler: TOTPActionHandler): void
	addActionHandler(name:"normal-captcha", handler: NormalCaptchaActionHandler): void
	addActionHandler(name: "recaptcha", handler: ReCaptchaActionHandler): void
	addActionHandler(name: string, handler: ActionHandler) {
		switch(name) {
		case "totp":
			this.totp.addActionHandler(handler);
			break;
		case "normal-captcha":
			this.normalCaptcha.addActionHandler(handler);
			break;
		case "recaptcha":
			this.recaptcha.addActionHandler(handler);
			break;
		default:
			throw Error(`No ActionHandler of name '${name}'`);
		}
	}

	async login(request: LoginRequest): Promise<RequestSession> {
		const context = await this.options.browserController.createLoginBrowserContext();
		const page = await SessionPage.init(context);
		const cdpSession = await page.target().createCDPSession();

		const loginContext = new RequestContext(request, context, page, cdpSession);
		return new RequestSession(this.startHandler, this.retry,loginContext);
	}
}