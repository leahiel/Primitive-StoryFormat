/***
 * The Outputter manipulates the DOM on the HTML document.
 * The Outputter also exports data.
 */

var Outputter = (() => {
    'use strict';

    /**
     * Clears the #output HTML element.
     */
    function _clearoutput() {
        document.getElementById('output').innerHTML = "";
    }

    /**
     * Outputs the HTML export into the HTML document.
     */
    function output_test_html() {
        _waitForElm('#output').then((elm) => {
            _clearoutput();

            for (let i in Parser.passages) {
                let child = document.createElement('div');
                child.setAttribute('id', `${Parser.passages[i].getAttribute('name')}`);
                child.setAttribute('original-passage-name', `:: ${Parser.passages[i].getAttribute('name')}`);
                child.appendChild(Parser.passages[i]);
                elm.appendChild(child);
            }
        });
    }
    

    /**
     * Outputs the generated errors into the HTML document.
     */
    function output_errors() {
        if (Parser.errors.length > 0) {
            console.error(Parser.errors); // DEBUG
            _waitForElm('#error-notices').then((elm) => {
                for (let error in Parser.errors) {
    
                    let child = document.createElement('div');
                    child.innterHTML = `${Parser.errors[error]}`;
                    elm.appendChild(child);
                }
            });
        }
    }
    
    /**
     * Outputs the generated warnings into the HTML document.
     */
    function output_warnings() {
        if (Parser.warnings.length > 0) {
            console.warn(Parser.warnings); // DEBUG
            _waitForElm('#warning-notices').then((elm) => {
                for (let warning in Parser.warnings) {
    
                    let child = document.createElement('div');
                    child.innerHTML = `Warning:<br> ${Parser.warnings[warning]}`;
                    elm.appendChild(child);
                }
            })
        }
    }



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


    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
        put_errors : { value : output_errors },
        put_warnings : { value : output_warnings},
        put_test_html : { value : output_test_html},
    }));    
})();
