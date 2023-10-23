var version = Object.freeze({
	title: 'Primitive',
	major: '{{BUILD_VERSION_MAJOR}}',
	minor: '{{BUILD_VERSION_MINOR}}',
	patch: '{{BUILD_VERSION_PATCH}}',
	prerelease: '{{BUILD_VERSION_PRERELEASE}}',
	build: '{{BUILD_VERSION_BUILD}}',
	date: new Date('{{BUILD_VERSION_DATE}}'),

	toString() {
		'use strict';

		const prerelease = this.prerelease ? `-${this.prerelease}` : '';
		return `${this.major}.${this.minor}.${this.patch}${prerelease}+${this.build}`;
	},

	short() {
		'use strict';

		const prerelease = this.prerelease ? `-${this.prerelease}` : '';
		return `${this.title} (v${this.major}.${this.minor}.${this.patch}${prerelease})`;
	},

	long() {
		'use strict';

		return `${this.title} v${this.toString()} (${this.date.toUTCString()})`;
	}
});

var config = {};
window.Primitive = {};

// Main Function, entry point for the story. 
(() => {
	'use strict';

	console.log('Primitive Document loaded; beginning startup.');

	/* PUT passages on screen. */

	Outputter.put_errors();
	Outputter.put_warnings();
})();
