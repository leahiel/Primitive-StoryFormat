/***
 * The Processer edits the inner and outer HTML of every Passage, prior to it being sent 
 * to the Outputter to show to the Author.
 * 
 * First, it performs elementary Passage editing that is common to all output processes.
 * Then, depending on which output is desired, it processes those passages to make them 
 * possible for the Outputter to transpile them into their requested output form.
 * 
 * ===== Walking the Graph
 * TODO The parser should create a JSON that outputs the passage, with each possible
 * outbound link, for 'walking the graph' purposes. 
 * TODO Additionally, that object should state whether each possible State Variable is 
 * even possible to achieve, or required, at all.
 * 
 * So we would have every possible variation of a passage. Then we would use the passage's
 * object to determine which one should be used.
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
            _passages[i].variables = {};
            _linkerindex.push(_passages[i].getAttribute('name'));

            // Get all potential variables into the passage.
            for (let nbsv of Parser.variables) {
                _passages[i].variables[nbsv] = null
            }

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
        regex = /(?<!:)\/\/.*/g;
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
        let outboundLinkHREF = [];

        // Get and convert links.
        do {
            match = regex.exec(_innerHTML);
            if (match) {
                links[match[0]] = _convertLink(match[0]);
            }
        } while (match);

        for (let link in links) {
            _innerHTML = _innerHTML.replace(link, links[link].outerHTML);

            // FIXME This isn't very secure. If passage names are weird, this will fail.
            outboundLinkHREF.push(links[link].outerHTML.substring(
                links[link].outerHTML.indexOf("\"#") + 2,
                links[link].outerHTML.lastIndexOf("\"")
            ).replace("[[", "").replace("]]", ""));
        }

        /* Update passage */
        _passages[i].innerHTML = _innerHTML;
        _passages[i].outboundLinkHREF = outboundLinkHREF;
    }

    /* Generate passage-nodes */
    _walkOriginalNodes(_passages)
    console.log(_mermaidOriginalNodes(_passages))



    /* HTML Processing */

    /** A deep clone of Parser.passages. */
    let _htmlpassages = [];
    for (let i in _passages) {
        _htmlpassages.push(_passages[i].cloneNode(true));
    }

    let _processedhtmlpassages = [];
    let _allpossiblenbsvstates = getnbsvstates(Parser.variables.length);

    let _shuffledHTMLIndex = 1;
    for (let i in _htmlpassages) {
        // Prepend Header Text
        let psg = _htmlpassages[i]

        if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
            let h2 = document.createElement('h2');
            h2.innerText = psg.getAttribute('name');
            psg.prepend(h2);

            _processedhtmlpassages.push(psg);

        } else if (psg.getAttribute('data-placement') === 'body-matter') {
            // Duplicate passages for each possible variable value.
            for (let nbsv of _allpossiblenbsvstates) {
                let _duplicated_passage = psg.cloneNode(true);
                let h2 = document.createElement('h2');

                // Ensure no duplicate values on certain attributes.
                let name = _duplicated_passage.getAttribute('name');
                let id = _duplicated_passage.getAttribute('id');
                let pid = _duplicated_passage.getAttribute('pid');
                _duplicated_passage.setAttribute('original_name', name);
                _duplicated_passage.setAttribute('name', `${name}-${nbsv}`);
                _duplicated_passage.setAttribute('id', `${id}-${nbsv}`);
                _duplicated_passage.setAttribute('pid', `${pid}-${nbsv}`);
                _duplicated_passage.setAttribute('nbsv', nbsv);
                _duplicated_passage.setAttribute('outboundnbsv', nbsv);

                h2.innerText = `Passage ${_shuffledHTMLIndex}`;
                _duplicated_passage.prepend(h2);

                _processedhtmlpassages.push(_duplicated_passage);

                _shuffledHTMLIndex++;
            }

        } else {
            // Passage is neither body-matter or front-matter/back-matter, which shouldn't be able to happen.
        }
    }

    console.log(_processedhtmlpassages);

    /* Process Macros */
    for (let psg of _processedhtmlpassages) {
        let regex = /&lt;&lt;.*&gt;&gt;/g;
        let _innerHTML = psg.innerHTML;
        let match;

        do {
            match = regex.exec(_innerHTML);
            if (match) {
                // Process Macros
                let macro = match.toString().replace('&lt;&lt;','').replace('&gt;&gt;','').replace('else if','elseif').split(" ");
                
                switch (macro[0].toLowerCase()) {
                    case 'if':
                        // console.log('if NYI');
                        break;
                    case 'else':
                        // console.log('else NYI');
                        break;
                    case 'elseif':
                        // console.log('elseif NYI');
                        break;
                    case 'endif':
                        // console.log('endif NYI');
                        break;
                    case 'set':
                        Macros.set(macro.slice(1).join(' '), psg);
                        break;
                    case 'unset':
                        Macros.unset(macro.slice(1).join(' '), psg);
                        break;
                    default:
                        console.warn(`The Macro '${macro[0]}' found in Passage '${psg.getAttribute('original_name')}' is not a valid macro.`);
                }
            }
        } while (match);

    }
    console.log('macros processed')


    /* Update links to NBSV passages. */
    for (let psg of _processedhtmlpassages) {
        let links = psg.getElementsByTagName('a');

        for (let link of links) {
            let outboundpsg = link.getAttribute('href').replace('#',"").replace("[[", "").replace("]]", "");
            let outboundnbsv = psg.getAttribute('outboundnbsv');

            // TODO check for set and unset here.

            let linkname = `${outboundpsg}-${outboundnbsv}`;
            let outboundpsgid = "";
            let _errored = false; // don't process 

            for (let ppsg of _processedhtmlpassages) {
                if (linkname == ppsg.getAttribute('name')) {
                    if (ppsg.getAttribute("data-placement") != 'body-matter') {
                        _errored = true;
                    }

                    outboundpsgid= ppsg.getAttribute('id')
                    continue;
                }

                // TODO Error here if passage is not found.
            }

            if (!_errored) {
                link.setAttribute('href', `#${outboundpsgid}`)
            }
        }
    }


    /* EPUB Processing */
    /** A deep clone of Parser.passages. */
    let _epubpassages = [];
    for (let i in _passages) {
        _epubpassages.push(_passages[i].cloneNode(true));
    }

    let _processedepubpassages = _epubpassages; // No EPUB pre-processing needed... yet.

    /* Helper Functions */

    function getnbsvstates(num) {
        if (isNaN(num)) {
            // TODO Write an actual error.
            return;
        }

        let sol = [];
        let i = 0;

        while (i < num) {
            if (sol.length == 0) {
                sol.push('N');
                sol.push('T');
                sol.push('F');
            } else {
                let int = [...sol];
                sol = [];

                for (let str of int) {
                    sol.push(str + 'N');
                    sol.push(str + 'T');
                    sol.push(str + 'F');
                }
            }

            i++
        }

        return sol;
    }

    /** 
     * Shuffles the array. 
     * 
     * @param {any[]} array 
     * 
     * Taken from https://stackoverflow.com/a/2450976 
     * CC BY-SA 4.0, no changes. 
     */
    function shuffle(array) {
        let currentIndex = array.length,
            randomIndex;

        // While there remain elements to shuffle. 
        while (currentIndex > 0) {

            // Pick a remaining element. 
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element. 
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }

        return array;
    }

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
            let a_elm;
            if (Parser.config['enable-hyperlinks']) {
                a_elm = document.createElement('a');

                // The `href` is a Passage Title, so we need to get the converted passage ID from the Passage Title.
                if (_linkerindex.indexOf(href) > 0) {
                    // NOTE: _linkerindex[0] is the error passage that exists to 
                    // shift the array down by one, so we don't care about it.
                    href = _linkerindex.indexOf(href)
                    a_elm.setAttribute('href', `#${href}`);
                } else {
                    a_elm.setAttribute('href', `#${href}`);
                }
            } else {
                a_elm = document.createElement('span');
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
     * Adds the populated field outboundOrigPID to each Story Passage. 
     * outboundOrigPID contains the original PID of each outbound link within the passage.
     * 
     * @param {tw-passagedata} array 
     */
    function _walkOriginalNodes(passages) {
        // Go through every outbound link in the passage, and find the PID for it.
        for (let passage of passages) {
            passage.outboundOrigPID = [];

            for (let outbound of passage.outboundLinkHREF) {
                // Check shuffled passages for PID.
                if (_linkerindex[outbound]) {
                    passage.outboundOrigPID.push(_linkerindex[outbound])
                    continue;
                }

                let isFound = false;
                // Check non-shuffled passages for PID.
                // TODO: Make a list of non-shuffled passages to greatly reduce the amount of passages to loop through.
                for (let otherpassage of passages) {
                    if (outbound === otherpassage.attributes.name.value) {
                        passage.outboundOrigPID.push(otherpassage.attributes.pid.value);
                        isFound = true;
                    }
                }

                if (!isFound) {
                    console.warn(`Outbound ${outbound} was not found as a passage name or a PID.`);
                }
            }
        }

        console.log(passages)
    }

    /** 
     * Returns a string of Mermaid that can be used to graphically display the nodes.
     * 
     * @param {tw-passagedata} array 
     */
    function _mermaidOriginalNodes(passages) {
        let connections = [];

        for (let passage in passages) {
            let psg = passages[passage]

            // Ensure there are links to look at.
            // TODO Add isolated links to a subgraph of isolated passages.
            if (psg.outboundOrigPID.length <= 0) {
                continue;
            }

            // TODO Figure out how to handle front and back matter.
            if (psg.attributes['data-placement'].value !== 'body-matter') {
                continue;
            }

            // TODO Order this by PID and not name.
            let current = psg.attributes.name.value.replace(/\s/g, ""); // whitespace not allowed in mermaid

            psg.outboundOrigPID.forEach((PID) => {
                let connect_str = `${current} --> ${PID}`

                if (!connections.includes(connect_str)) {
                    connections.push(connect_str)
                }
            });

        }

        let collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: 'base'
        });
        connections = connections.sort(collator.compare);
        connections.unshift("flowchart LR");
        return connections.join('\n');
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
        original_passages: {
            value: getPassages
        },
    }));
})();