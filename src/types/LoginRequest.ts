export type LoginRequest = {
    identifier: string,
    password: string,
	totpSecret: string,
	loadCookies?: boolean,
    saveCookies?: boolean
}