/***********************************************************************************************************************

	primitive.js

	Copyright © 2023-2024, S. Herring <sfkherrin@yahoo.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

var config = {};
window.Primitive = {};

// Main Function, entry point for the story. 
(() => {
	'use strict';

	/* Erase now useless tw-storydata Element. */
	// NOTE: Leaving this in causes a few issues, including intra-webpage navigation.
	document.getElementsByTagName('tw-storydata')[0].remove();

	/* PUT passages on screen. */
	Outputter.put_errors();
	Outputter.put_warnings();

	/* Add functionality to Header Buttons */
	_waitForElm('#primitive-test-html').then((elm) => {
		elm.addEventListener("click", () => {
			Outputter.put_test_html();
		});
	});

	_waitForElm('#primitive-export-html').then((elm) => {
		elm.addEventListener("click", () => {
			Outputter.export_html();
		});

		if (Parser.config['direct-to-html']) {
			Outputter.export_html();
		}
	});

	_waitForElm('#primitive-export-epub').then((elm) => {
		elm.addEventListener("click", () => {
			Outputter.export_epub();
		});

		if (Parser.config['direct-to-epub']) {
			Outputter.export_epub();
		}
	});



	/* Helper Functions */

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
	 * Original taken from https://stackoverflow.com/a/61511955
	 * CC BY-SA 4.0. Modified by TheMadExile at:
	 * https://discord.com/channels/389867840406159362/389868418855075840/1225689537376944188
	 * 
	 */
	function _waitForElm(selector) {
		return new Promise(resolve => {
			const el = document.querySelector(selector);

			if (el) {
				return resolve(el);
			}

			const observer = new MutationObserver(mutations => {
				const el = document.querySelector(selector);

				if (el) {
					observer.disconnect();
					resolve(el);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}
})();