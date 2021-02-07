// Borrowed from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523

export function uuid(): string {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(parseInt(c) ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
	);
}