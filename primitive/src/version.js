/***********************************************************************************************************************

	version.js

	This file was excised from Thomas Michael Edwards' build.js file, available under the BSD 2-clause 
	"Simplified" License, Copyright © 2020–2021. You may find the original file excised from at:
	https://github.com/tmedwards/sugarcube-2/blob/27903a854b7bedbb9fa60efa33e47c99bab7a359/build.js

	Thank you to TME for using such an unrestrictive license.

	This version of the file is also governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE 
	file. Copyright © 2023-2024, S. Herring <sfkherrin@yahoo.com>. All rights reserved.

***********************************************************************************************************************/

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