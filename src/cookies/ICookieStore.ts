import { Protocol } from "puppeteer";

export interface ICookieStore {
    get(identifier: string): Promise<Protocol.Network.Cookie[] | undefined>
    set(identifier: string, cookies: Protocol.Network.Cookie[]): Promise<void>
}