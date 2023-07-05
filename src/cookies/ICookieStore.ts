import { Protocol } from "puppeteer";

interface ICookieStore {
    get(identifier: string): Promise<Protocol.Network.Cookie[] | undefined>
    set(identifier: string, cookies: Protocol.Network.Cookie[]): Promise<void>
}

export default ICookieStore;