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

    function export_epub() {
        let jepub = new jEpub();

        try {
            jepub.init({
                i18n: 'en', // Internationalization
                title: 'Book title',
                author: 'Book author',
                publisher: 'Book publisher',
                description: '<b>Book</b> description', // optional
                tags: [ 'epub', 'tag' ] // optional
            });

            let shuffled_number = 1;
            for (let i in Parser.passages) {
                // TODO The title should be different based on shuffled chapter or not.
                // TODO if shuffled, then title = shuffled_number; shuffled_number++
                jepub.add(i.toString(), Parser.passages[i].outerHTML);
            }

            jepub.generate().then(filecontent => {
                console.log(filecontent);
        
                // TODO: Make a download EPUB pop-up.

                // const url = URL.createObjectURL(filecontent), filename = 'lorem-ipsum.epub';
        
                // let link = document.createElement('a');
                // document.body.appendChild(link);
                // link.href = url;
                // link.textContent = 'Download EPUB';
                // link.download = filename;
                
                // TODO: Make the automatic download a dev only thing.
                saveAs(filecontent, filename);
            }).catch(err => {
                console.error(err);
            });

            console.log("EPUB successfully generated.")
        } catch(err) {
            console.error(err);
        }
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

    // TODO This shouldn't be needed here, only in primitive.js, since the buttons shouldn't be clickable until the document is fully loaded.
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
        export_epub : {value : export_epub},
    }));    
})();
