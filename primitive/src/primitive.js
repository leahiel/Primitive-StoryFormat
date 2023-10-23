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

	waitForElm('#output').then((elm) => {
		for (let i in Parser.passages) {
			let child = document.createElement('div');
			child.setAttribute('id', `${Parser.passages[i].getAttribute('name')}`);
			child.setAttribute('original-passage-name', `:: ${Parser.passages[i].getAttribute('name')}`);
			child.appendChild(Parser.passages[i]);
			elm.appendChild(child);
		}
	});

	if (Parser.errors.length > 0) {
		console.error(Parser.errors); // DEBUG
		waitForElm('#error-notices').then((elm) => {
			for (let error in Parser.errors) {

				let child = document.createElement('div');
				child.innterHTML = `${Parser.errors[error]}`;
				elm.appendChild(child);
			}
		});
	}

	if (Parser.warnings.length > 0) {
		console.warn(Parser.warnings); // DEBUG
		waitForElm('#warning-notices').then((elm) => {
			for (let warning in Parser.warnings) {

				let child = document.createElement('div');
				child.innerHTML = `Warning:<br> ${Parser.warnings[warning]}`;
				elm.appendChild(child);
			}
		});
	}


	
	/**
	 * Waits for an element to exist before doing thing.
	 *
	 * ```
	 * const elm = await waitForElm('.some-class');
	 * // or
	 * waitForElm('.some-class').then((elm) => {
	 *  console.log('Element is ready');
	 *  console.log(elm.textContent);
	 * });
	 * ```
	 * 
	 * @param {CSS_Selector} selector 
	 * 
	 * Taken from https://stackoverflow.com/a/61511955
	 * CC BY-SA 4.0, no changes
	 */
	function waitForElm(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}
})();
