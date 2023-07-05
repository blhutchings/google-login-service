import { Protocol } from "puppeteer";
import { LoginRequest } from "./LoginRequest.js";

export class LoginResponse {
	message: string;
	request: LoginRequest;
	cookies: Protocol.Network.Cookie[];
	constructor(message: string, request: LoginRequest, cookies: Protocol.Network.Cookie[]) {
		this.message = message;
		this.request = request;
		this.cookies = cookies;
	}
}

