/***
 * The Processer edits the inner and outer HTML of every Passage, prior to it being sent 
 * to the Outputter to show to the Author.
 * 
 * First, it performs elementary Passage editing that is common to all output processes.
 * Then, depending on which output is desired, it processes those passages to make them 
 * possible for the Outputter to transpile them into their requested output form.
 */

var Processer = (() => {
    'use strict';

    let _passages = Parser.passages;

    /* OuterHTML Generic Processing */
    let _linkerindex = ["ErrorPassage"];
    let _shuffledIndex = 1;
    for (let i in _passages) {

        // Determine Element ID
        if (['front-matter', 'back-matter'].includes(_passages[i].getAttribute('data-placement'))) {
            // Set the ID of the HTML Element to the name of the Passage if it's in the front or back matter.
            _passages[i].setAttribute('id', _passages[i].getAttribute('name'));

        } else if (_passages[i].getAttribute('data-placement') === 'body-matter') {
            // Set the ID of the HTML Element to an increasing number if it's in the body matter.
            _passages[i].setAttribute('id', _shuffledIndex);
            _linkerindex.push(_passages[i].getAttribute('name'));

            _shuffledIndex++;
        } else {
            // Somehow, the HTML Element has no 'data-placement' attribute.
            // Parser.errors.push(`Unable to determine data-placement of :: ${_passages[i].getAttribute('name')}.`);
        }
    }



    /* InnerHTML Generic Processing */
    let converter = new showdown.Converter();
    converter.setOption('simpleLineBreaks', true);
    converter.setOption('openLinksInNewWindow', true);
    converter.setOption('noHeaderId', true);
    converter.setOption('prefixHeaderId', 'custom-'); // If an ID is set somehow, it'll have 'custom-' as a prefix.
    converter.setOption('requireSpaceBeforeHeadingText', true);

    for (let i in _passages) {
        let regex;
        let _innerHTML = _passages[i].innerHTML;

        /* Remove Comments */
        // JavaScript Single Line Comments: `// Comment Text`
        regex = /\/\/.*/g;
        _innerHTML = _innerHTML.replace(regex, "");

        // Double Pound Single Line Comments: `## Comment Text`
        // FIXME: Got a bit of an incompatibility here with Markdown Headers.
        regex = /##.*/g;
        _innerHTML = _innerHTML.replace(regex, "");

        // JavaScript Block Comments: `/* Comment Text */`
        regex = /\/\*[\S\s]*?\*\//g;
        _innerHTML = _innerHTML.replace(regex, "");

        // HTML Block Comments: `<!-- Comment Text -->`
        regex = /&lt;!--[\S\s]*?--&gt;/g;
        _innerHTML = _innerHTML.replace(regex, "");



        /* Validate HTML tags */
        // TODO: Validate HTML tags here. Only a very limited number of standard HTML tags are allowed as per the EPUB3.3 standard. Most of these are handled by Primitive, to allow the Author to not worry about these. Therefore, if the Author is trying to do something, like add a <script> tag, then we need to ensure that the Author knows that Primitive is not the place for that.



        /* Convert Markdown to HTML */
        _innerHTML = converter.makeHtml(_innerHTML);



        /* Parse Links */
        regex = /\[\[(.*?)\]\]/g;
        let links = {};
        let match;

        // Get and convert links.
        do {
            match = regex.exec(_innerHTML);
            if (match) {
                links[match[0]] = _convertLink(match[0]);
            }
        } while (match);

        for (let link in links) {
            _innerHTML = _innerHTML.replace(link, links[link].outerHTML);
        }



        /* Update passage */
        _passages[i].innerHTML = _innerHTML;
    }



    /* HTML Processing */

    /** A deep clone of Parser.passages. */
    let _htmlpassages = [];
    for (let i in _passages) {
        _htmlpassages.push(_passages[i].cloneNode(true));
    }

    let _processedhtmlpassages = [];

    let _shuffledHTMLIndex = 1;
    for (let i in _htmlpassages) {
        // Prepend Header Text
        let h2 = document.createElement('h2');

        if (['front-matter', 'back-matter'].includes(_htmlpassages[i].getAttribute('data-placement'))) {
            h2.innerText = _htmlpassages[i].getAttribute('name');
            _htmlpassages[i].prepend(h2);

        } else if (_htmlpassages[i].getAttribute('data-placement') === 'body-matter') {
            h2.innerText = `Passage ${_shuffledHTMLIndex}`;
            _htmlpassages[i].prepend(h2);

            _shuffledHTMLIndex++;
        }

        _processedhtmlpassages.push(_htmlpassages[i]);
    }



    /* EPUB Processing */
    /** A deep clone of Parser.passages. */
    let _epubpassages = [];
    for (let i in _passages) {
        _epubpassages.push(_passages[i].cloneNode(true));
    }

    let _processedepubpassages = _epubpassages; // No EPUB pre-processing needed... yet.



    /* Helper Functions */

    /**
     * Converts a Twine Link into an HTML Element
     * 
     * @param {String} link
     * @return {HTML Element}
     */
    function _convertLink(link) {
        /**
         * Create and return an <a href="#href">text</a> HTML Element.
         * 
         * @param {String} text Display Text
         * @param {String} href Passage Title
         * @return {HTMLELement}
         */
        function _createLink(text, href) {
            let a_elm = document.createElement('a');

            // The `href` is a Passage Title, so we need to get the converted passage ID from the Passage Title.
            if (_linkerindex.indexOf(href) > 0) {
                // NOTE: _linkerindex[0] is the error passage that exists to 
                // shift the array down by one, so we don't care about it.
                href = _linkerindex.indexOf(href)
                a_elm.setAttribute('href', `#${href}`);
            } else {
                a_elm.setAttribute('href', `#${href}`);
            }

            // Check for link-affixes.
            for (let affix in Parser.config["link-affixes"]) {
                if (text === affix) {
                    // Replace %n if found.
                    if (Parser.config["link-affixes"][affix].includes('%n')) {
                        a_elm.innerText = Parser.config["link-affixes"][affix].replace('%n', href);
                        return a_elm;
                    } else {
                        a_elm.innerText = Parser.config["link-affixes"][affix];
                        return a_elm;
                    }
                }
            }

            // link-affix not found.
            a_elm.innerText = text;
            return a_elm;
        }

        if (link.split("-&gt;")[1]) {
            // Found [[display text->link]] format.
            return _createLink(link.split("-&gt;")[0].split("[[")[1], link.split("-&gt;")[1].split("]]")[0]);

        } else if (link.split("&lt;-")[1]) {
            // Found [[link<-display text]] format.
            return _createLink(link.split("&lt;-")[1].split("]]")[0], link.split("&lt;-")[0].split("[[")[1]);

        } else if (link.split("|")[1]) {
            // Found [[display text|link]] format.
            return _createLink(link.split("|")[0].split("[[")[1], link.split("|")[1].split("]]")[0]);

        } else {
            // Found [[link]] format.
            return _createLink(link, link);
        }
    }

    /**
     * Returns a deep clone of the properly processed passages.
     */
    function getPassages(type) {
        let passages = [];

        if (type.toLowerCase() === "html") {
            for (let i in _processedhtmlpassages) {
                passages.push(_processedhtmlpassages[i].cloneNode(true));
            }
        } else if (type.toLowerCase() === "epub") {
            for (let i in _processedepubpassages) {
                passages.push(_processedepubpassages[i].cloneNode(true));
            }
        }

        return passages;
    }

    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
        passages: {
            value: getPassages
        },
    }));
})();