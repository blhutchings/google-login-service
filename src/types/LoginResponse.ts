import { Protocol } from "puppeteer";
import { LoginRequest } from "./LoginRequest.js";
import RequestContext from "../RequestContext.js";

export type LoginResponse = {
	message: string;
	request: LoginRequest;
	cookies: Protocol.Network.Cookie[];
	context?: RequestContext;
}

