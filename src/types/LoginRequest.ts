export type LoginRequest = {
    identifier: string,
    password: string,
	loadCookies?: boolean,
    saveCookies?: boolean
}