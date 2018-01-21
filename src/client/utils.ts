export const valuesPolyfill = function values (object) {
	return Object.keys(object).map(key => object[key]);
};

export const flatMap = (f,xs) => xs.reduce((acc,x) => acc.concat(f(x)), []);

export const enumValues = (myEnum) => {
	return Object.keys(myEnum)
		.map((k: any) => myEnum[k])
		.filter((v: any) => typeof v === 'number').map(Number);
};

export const sortNumbers = array => {
	return array.sort((a, b) => a - b);
};

export class Deferred<T> {

	private _promise: Promise<T>;
	private _resolve: (value?: T | Thenable<T>) => void;
	private _reject: (reason?: any) => void;

	constructor() {
		this._promise = new Promise<T>((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	}

	get promise(): Promise<T> {
		return this._promise;
	}

	resolve = (value?: T | Thenable<T>): void => {
		this._resolve(value);
	};

	reject = (error?: any): void => {
		this._reject(error);
	};

}
