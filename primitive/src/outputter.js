/***
 * The Outputter manipulates the DOM on the Primitive Export Screen.
 * 
 * The Outputter also exports stories.
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

            /** Put HTML onto Primitive Export Screen */
            for (let i in Processer.passages('html')) {
                elm.appendChild(Processer.passages('html')[i]);
            }
        });
    }

    /**
     * Exports an EPUB to be saved by the browser.
     */
    function export_epub() {
        let passages = Processer.passages('epub');

        let epub = new EpubMaker()
            .withTemplate('idpf-wasteland')
            .withTitle('Primitive Test');

        // Create and add Passages [called Sections with js-epub-maker] to EPUB.
        for (let i in passages) {

            // Set proper Section Headers.
            let section;
            if (['front-matter', 'back-matter'].includes(passages[i].getAttribute('data-placement'))) {
                // Front & Back Matter
                section = {
                    content: passages[i].innerHTML,
                    title: passages[i].getAttribute('id')
                }
            } else {
                // Shuffled Matter
                section = {
                    content: passages[i].innerHTML,
                    title: `Passage ${passages[i].getAttribute('id')}`
                }
            }

            // Add Sections to EPUB.
            epub.withSection(
                new EpubMaker.Section("bodymatter", passages[i].getAttribute('id'), section, true, false)
            );
        }

        epub.downloadEpub(modifyEPUB);
    }

    /**
     * Outputs the generated errors into the HTML document.
     */
    function output_errors() {
        _waitForElm('#error-notices').then((elm) => {
            if (Parser.errors.length > 0) {
                console.error(Parser.errors); // DEBUG
                for (let error in Parser.errors) {

                    let child = document.createElement('div');
                    child.innterHTML = `${Parser.errors[error]}`;
                    elm.appendChild(child);
                }
            }
        });
    }

    /**
     * Outputs the generated warnings into the HTML document.
     */
    function output_warnings() {
        _waitForElm('#warning-notices').then((elm) => {
            if (Parser.warnings.length > 0) {
                console.warn(Parser.warnings); // DEBUG
                for (let warning in Parser.warnings) {

                    let child = document.createElement('div');
                    child.innerHTML = `Warning:<br> ${Parser.warnings[warning]}`;
                    elm.appendChild(child);
                }

            }
        });
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

    // Let us modify the EPUB after it has been generation.
    function modifyEPUB(epubZipContent, epubTitle) {
        let jszip = new Jszip310(); // js-maker-epub uses 2.5.0, but we needed a modern version.

        /** The file name of the CSS file. */
        let cssfilename = `${epubTitle.split('.epub')[0]}.css`;

        /** The original content of the CSS file. */
        let css_content;
        
        jszip.loadAsync(epubZipContent).then((zip) => {
            zip.folder('EPUB').file(cssfilename).async("string").then((content) => {
                // Get the CSS
                css_content = content;

                // Update the CSS
                // TODO New CSS should be prepended to old CSS.
                zip.folder('EPUB').file(cssfilename, "lol");

                // Regenerate the EPUB.
                zip.generateAsync({
                    type: 'blob',
                    mimeType: 'application/epub+zip',
                    compression: 'DEFLATE',
                    compressionOptions: {
                        level: 9
                    }
                }).then(function (blob) {
                    // Save the EPUB.
                    saveAs(blob, epubTitle);
                });
            });
        });
    }



    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
        put_errors: {
            value: output_errors
        },
        put_warnings: {
            value: output_warnings
        },
        put_test_html: {
            value: output_test_html
        },
        export_epub: {
            value: export_epub
        },
    }));
})();
