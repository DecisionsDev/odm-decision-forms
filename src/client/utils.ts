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
