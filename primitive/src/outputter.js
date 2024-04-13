// The outputter deals with displaying the passages to the screen. It also shuffles them. Because it shuffles them, it also adds the h2 tag identifying the passage to the passage. 

/***
 * The Outputter manipulates the DOM on the Primitive Export Screen.
 * 
 * The Outputter also exports stories.
 * TODO: Split export functionality into Exporter. The outputter should edit passages.
 */

var Outputter = (() => {
    'use strict';

    // // Prepend Header Text
    // if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
    //     let h2 = document.createElement('h2');
    //     h2.innerText = psg.getAttribute('name');
    //     psg.prepend(h2);

    //     _processedhtmlpassages.push(psg);

    // } else if (psg.getAttribute('data-placement') === 'body-matter') {
    //     // Duplicate passages for each possible variable value.
    //     for (let nbsv of _allpossiblenbsvstates) {
    //         let _duplicated_passage = psg.cloneNode(true);
    //         let h2 = document.createElement('h2');

    //         // Ensure no duplicate values on certain attributes.
    //         let name = _duplicated_passage.getAttribute('name');
    //         let id = _duplicated_passage.getAttribute('id');
    //         let pid = _duplicated_passage.getAttribute('pid');
    //         _duplicated_passage.setAttribute('original_name', name);
    //         _duplicated_passage.setAttribute('name', `${name}-${nbsv}`);
    //         _duplicated_passage.setAttribute('id', `${id}-${nbsv}`);
    //         _duplicated_passage.setAttribute('pid', `${pid}-${nbsv}`);
    //         _duplicated_passage.setAttribute('nbsv', nbsv);
    //         _duplicated_passage.setAttribute('outboundnbsv', nbsv);

    //         h2.innerText = `Passage ${_shuffledHTMLIndex}`;
    //         _duplicated_passage.prepend(h2);

    //         _processedhtmlpassages.push(_duplicated_passage);

    //         _shuffledHTMLIndex++;
    //     }

    // } else {
    //     // Passage is neither body-matter or front-matter/back-matter, which shouldn't be able to happen.
    // }

    /**
     * Outputs the HTML export into the HTML document.
     */
    function output_test_html() {
        _waitForElm('#output').then((elm) => {
            // Clear previous output.
            elm.innerHTML = "";

            // Append!
            elm.appendChild(_createHTML());
        });
    }

    function export_html() {
        let html = _createHTML();
        let blob = new Blob([html.outerHTML], {
            type: 'text/html'
        });
        let url = URL.createObjectURL(blob);

        saveAs(url, `${Parser.title}.html`);
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
    function _createHTML() {
        // TODO: Use a template.

        // html
        let html = document.createElement('html');

        // head
        let head = document.createElement('head');
        html.appendChild(head);

        let meta_charset = document.createElement('meta');
        meta_charset.setAttribute('charset', 'UTF-8');

        let title = document.createElement('title');
        title.innerText = Parser.title;

        let meta_viewport = document.createElement('meta');
        meta_viewport.setAttribute('name', 'viewport');
        meta_viewport.setAttribute('content', 'width=device-width,initial-scale=1');

        // TODO: Get this without being a pain.
        let primitive_style = document.createElement('style');
        primitive_style.setAttribute('id', 'primitive_style');
        primitive_style.innerHTML = "*{--headerfooterpadding:0.3rem;font-size:2.6vh;color:#111111}html{background-color:#F5F3E9}tw-passagedata{max-width:60vw;display:block;margin:auto}#wrapper{display:flex;flex-direction:column;height:100vh;width:100%}#output{display:flex;flex:1;flex-direction:column;margin:1rem}#error-notices,#warning-notices{display:flex;flex:0}#warning-notices{background-color:yellow}#error-notices{background-color:lightcoral}#error-notices:empty,#warning-notices:empty{display:none}#primitive-footer,#primitive-header{display:flex;flex:0;flex-direction:column;align-items:flex-start;background-color:#3f2a14;padding:0.3rem 1rem}#primitive-title{color:#eeeeee;font-size:1.5rem}#primitive-version-number{color:#eeeeee}";

        let custom_style = document.createElement('style');
        custom_style.setAttribute('id', 'primitive-custom-css');
        custom_style.innerHTML = Parser.htmlcss;

        // TODO: Figure out how to leave an HTML comment for license information lol.
        let license = document.createElement('license');
        license.setAttribute('style', 'display: none;');
        license.innerText = `Created with Primitive Version ${version.long()}.`;

        head.append(
            meta_charset,
            title,
            meta_viewport,
            primitive_style,
            custom_style,
            license,
        );

        // body
        let body = document.createElement('body');
        html.appendChild(body);

        // Put Passages into body 
        for (let i in Processer.passages('html')) {
            body.appendChild(Processer.passages('html')[i]);
        }

        return html;
    }

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
                zip.folder('EPUB').file(cssfilename, Parser.epubcss);

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
        export_html: {
            value: export_html
        },
        export_epub: {
            value: export_epub
        },
    }));
})();