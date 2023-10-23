var config = {};
window.Primitive = {};

// Main Function, entry point for the story. 
(() => {
	'use strict';

	console.log('Primitive Document loaded; beginning startup.');

	/* PUT passages on screen. */

	Outputter.put_errors();
	Outputter.put_warnings();

	/* Header Buttons */
	_waitForElm('#primitive-test-html').then((elm) => {
		elm.addEventListener("click", ()=>{
			Outputter.put_test_html();
		});
	});

	_waitForElm('#primitive-export-epub').then((elm) => {
		elm.addEventListener("click", ()=>{
			Outputter.export_epub();
		});
	});

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
	function _waitForElm(selector) {
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
