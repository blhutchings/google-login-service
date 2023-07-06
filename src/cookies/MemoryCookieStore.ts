import { Protocol } from "puppeteer";
import { ICookieStore } from "./ICookieStore";
import { LRUCache } from "lru-cache";

const defaultOptions: LRUCache.Options<string, Protocol.Network.Cookie[], unknown> = {
	max: 100,

	maxSize: 200,
	sizeCalculation: () => { return 1; },
};

export default class MemoryCookieStore implements ICookieStore {
	private identifiers: LRUCache<string, Protocol.Network.Cookie[]>;

	constructor(options: LRUCache.Options<string, Protocol.Network.Cookie[], unknown> = defaultOptions) {
		this.identifiers = new LRUCache(options);
	}

	async get(identifier: string): Promise<Protocol.Network.Cookie[] | undefined> {
		return this.identifiers.get(identifier);
	}
	async set(identifier: string, cookies: Protocol.Network.Cookie[]): Promise<void> {
		this.identifiers.set(identifier, cookies);
	}
}