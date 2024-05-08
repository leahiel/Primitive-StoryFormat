/***********************************************************************************************************************

    processer.js

	Copyright © 2023-2024, S. Herring <sfkherrin@yahoo.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

// TODO: Storing an array of non-body-matter passages would help reduce the amount of loops we need to do to find those passages.

/***
 * The Processer edits the inner and outer HTML of every Passage, prior to it being sent 
 * to the Outputter to show to the Author.
 * 
 * First, it performs elementary Passage editing that is common to all output processes.
 * Then, depending on which output is desired, it processes those passages to make them 
 * possible for the Outputter to transpile them into their requested output form.
 * 
 * ===== Walking the Graph
 * So we would have every possible variation of a passage. Then we would use the passage's
 * object to determine which one should be used.
 */

var Processer = (() => {
    'use strict';

    /*
        Original Passages
        ('Original', as in, pre-duplicated.)
    */
    let _originalpassages = [];
    for (let psg of Parser.passages) {
        _originalpassages.push(psg.cloneNode(true));
    }

    // Original Passages Processing
    for (let psg of _originalpassages) {
        let _innerHTML = psg.innerHTML;

        /* Set originalName */
        psg.originalName = psg.getAttribute('name');
        psg.setAttribute = psg.setAttribute('original-name', psg.originalName);

        /* Set outboundPsg */
        let regex = /\[\[(.*?)\]\]/g;
        let outboundpsgs = [];
        let match;

        do {
            // Find passage links for Optimization and Mermaid.
            match = regex.exec(_innerHTML);
            if (match) {
                if (match[0].split("-&gt;")[1]) {
                    // Found [[display text->link]] format.
                    outboundpsgs.push(match[0].split("-&gt;")[1].split("]]")[0]);
                } else if (match[0].split("&lt;-")[1]) {
                    // Found [[link<-display text]] format.
                    outboundpsgs.push(match[0].split("&lt;-")[0].split("[[")[1]);
                } else if (match[0].split("|")[1]) {
                    // Found [[display text|link]] format.
                    // DEPRECATED: This link format is deprecated and only kept for legacy reasons.
                    outboundpsgs.push(match[0].split("|")[1].split("]]")[0]);
                } else {
                    // Found [[link]] format.
                    outboundpsgs.push(match[0].split("[[")[1].split("]]")[0]);
                }
            }
        } while (match);

        psg.outboundpsgs = outboundpsgs;

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

        psg.innerHTML = _innerHTML;
    }

    // console.log(_mermaidize(_originalpassages, true));


    /* 
        Duplicated Passages based on NBSV.
    */
    let _duplicated_passages = [];
    let _nbsvstates = Parser.getnbsvstates(Parser.variables.length);

    for (let psg of _originalpassages) {
        if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
            let _dupe = psg.cloneNode(true);

            let name = _dupe.getAttribute('name');
            _dupe.setAttribute('id', `${name}-${"N".repeat(Parser.variables.length)}`);

            _duplicated_passages.push(_dupe);
        } else {
            for (let nbsv of _nbsvstates) {
                let _dupe = psg.cloneNode(true);

                // Ensure no duplicate values on certain attributes.
                let name = _dupe.getAttribute('name');
                let pid = _dupe.getAttribute('pid');
                _dupe.setAttribute('name', `${name}-${nbsv}`);
                _dupe.setAttribute('id', `${name}-${nbsv}`);
                _dupe.setAttribute('pid', `${pid}-${nbsv}`);
                _dupe.setAttribute('nbsv', nbsv);
                _dupe.setAttribute('outboundnbsv', nbsv);

                _duplicated_passages.push(_dupe);

                console.log('Created dupe.');
            }
        }
    }

    /* 
        Process Macros 
    */
    for (let psg of _duplicated_passages) {
        //psg.innerHTML.replace('&lt;', '<')
        //psg.innerHTML.replace('&gt;', '>')

        //let regex = /(<<.*?>>)/gm;
        let regex = /(&lt;&lt;.*?&gt;&gt;)/gm;
        let textarr = psg.innerHTML.split(regex);

        psg.innerHTML = control_flow(textarr, psg);

        function control_flow(textarr, psg) {
            let soltext = ""; // Solution text.

            while (textarr.length > 0) {
                let restofpassage = textarr.slice((textarr.length) * -1);
                let text = Macros.determine(restofpassage[0]);

                if (text.isOk) {
                    // Is a recognized macro.

                    let macroResult = Macros.run(text, restofpassage, psg);
                    textarr = macroResult.psgarr;
                    if (!macroResult.isOk) {
                        // Macro wasn't good, so just get rid of that line.
                        textarr.shift();
                    }

                    restofpassage = textarr;
                    soltext += control_flow(restofpassage, psg);
                    break;
                } else {
                    // Is normal text or an unrecognized macro.

                    soltext += textarr.shift();
                }
            }

            return soltext;
        }
    }



    /*
        Initialize Converter
    */
    let converter = new showdown.Converter();
    converter.setOption('simpleLineBreaks', true);
    converter.setOption('openLinksInNewWindow', true);
    converter.setOption('noHeaderId', true);
    converter.setOption('prefixHeaderId', 'custom-'); // If an ID is set somehow, it'll have 'custom-' as a prefix.
    converter.setOption('requireSpaceBeforeHeadingText', true);
    converter.setOption('smartIndentationFix', true);



    /* 
        Update links.
    */
    for (let psg of _duplicated_passages) {
        let _innerHTML = psg.innerHTML;
        /* Convert Markdown to HTML (We can't update links until we do this.) */
        // Prevent code blocks. https://showdownjs.com/docs/markdown-syntax/#multiple-lines
        _innerHTML = _innerHTML.replaceAll('    ', ''); // 4 Spaces
        _innerHTML = _innerHTML.replaceAll('       ', ''); // 2 Tabs

        // Convert
        _innerHTML = converter.makeHtml(_innerHTML);

        let outboundpsgs = [];
        let links = {};
        let regex = /\[\[(.*?)\]\]/g;
        let match;
        let outboundnbsv = psg.getAttribute('outboundnbsv');

        do {
            // Find links for mermaid.
            // BUG: No idea why the `&` is turning into `&amp;` after `Macro.if()`, but it is, so... uh... we check for that.
            _innerHTML = _innerHTML.replace('&amp;', '&');
            _innerHTML = _innerHTML.replace('&lt;', '<');
            _innerHTML = _innerHTML.replace('&gt;', '>');

            match = regex.exec(_innerHTML);
            if (match) {
                let link = match[0];
                let destination = '';
                let text = '';

                if (link.split("->")[1]) {
                    // Found [[display text->link]] format.
                    destination = `${link.split("->")[1].split("]]")[0]}-${outboundnbsv}`;
                    text = link.split("->")[0].split("[[")[1]
                } else if (link.split("<-")[1]) {
                    // Found [[link<-display text]] format.
                    destination = `${link.split("<-")[0].split("[[")[1]}-${outboundnbsv}`;
                    text = link.split("<-")[1].split("]]")[0];
                } else if (link.split("|")[1]) {
                    // Found [[display text|link]] format.
                    // DEPRECATED: This link format is deprecated and only kept for legacy reasons.
                    destination = `${link.split("|")[1].split("]]")[0]}-${outboundnbsv}`;
                    text = link.split("|")[0].split("[[")[1];
                } else {
                    // Found [[link]] format.
                    destination = `${link.split("[[")[1].split("]]")[0]}-${outboundnbsv}`;
                    text = link;
                }

                // Only body-matter has variables, so...
                // If Origin is NOT body-matter, add -N*numnbsv to ID.
                if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
                    let nulldest = `-${"N".repeat(Parser.variables.length)}`
                    destination = destination.split("-")[0] + nulldest
                }
                // If Destination is NOT body-matter, add -N*numnbsv to ID.
                for (let opsg of _originalpassages) {
                    if (destination.split("-")[0] === opsg.originalName) {
                        if (['front-matter', 'back-matter'].includes(opsg.getAttribute('data-placement'))) {
                            let nulldest = `-${"N".repeat(Parser.variables.length)}`
                            destination = destination.split("-")[0] + nulldest
                        }

                        break;
                    }
                }

                // Look up data-placement of destination. If body-matter add -NN. if not, remove it?

                outboundpsgs.push(destination);
                links[link] = _createLink(text, destination);
            }
        } while (match);

        psg.outboundpsgs = outboundpsgs;


        for (let link in links) {
            _innerHTML = _innerHTML.replace(link, links[link].outerHTML);

            // FIXME This isn't very secure. If passage names are weird, this will fail.
            links[link].outerHTML.substring(
                links[link].outerHTML.indexOf("\"#") + 2,
                links[link].outerHTML.lastIndexOf("\"")
            ).replace("[[", "").replace("]]", '');
        }

        psg.innerHTML = _innerHTML;
    }

    // let all_mermaid = _mermaidize(_duplicated_passages, false)
    // console.log(getPassagesFromMermaid(all_mermaid))

    /*
        Crawl through duplicated passages to find reachable passsages.
    */
    // TODO keep track of startpsg so we don't have to find it.
    let startpsg;
    for (let psg of _duplicated_passages) {
        if (psg.getAttribute('name') === `${Parser.startpassage}-${"N".repeat(Parser.variables.length)}`) {
            startpsg = psg;
            break
        }
    }

    let true_mermaid = MermaidizeFromPassage(startpsg);
    let _truepassagenames = getPassagesFromMermaid(true_mermaid);
    let _truepassages = [];

    for (let psg of _duplicated_passages) {
        // Only process the places we can actually reach.
        if (_truepassagenames.includes(psg.getAttribute('name'))) {
            let truepsg = psg.cloneNode(true);
            truepsg.outboundpsgs = psg.outboundpsgs;

            _truepassages.push(truepsg);
        }

        if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
            let truepsg = psg.cloneNode(true);
            truepsg.outboundpsgs = psg.outboundpsgs;

            _truepassages.push(truepsg);
        }
    }

    console.log(_mermaidize(_originalpassages, true));
    console.log(_mermaidize(_truepassages, false));



    /* HTML Processing */
    let _htmlpassages = [];
    for (let psg of _truepassages) {
        _htmlpassages.push(psg.cloneNode(true));
    }

    let _processedhtmlpassages = _htmlpassages; // no HTML pre-processing needed... yet.


    /* EPUB Processing */
    let _epubpassages = [];
    for (let psg of _truepassages) {
        _epubpassages.push(psg.cloneNode(true));
    }

    let _processedepubpassages = _epubpassages; // No EPUB pre-processing needed... yet.

    /* Helper Functions */


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
            a_elm.setAttribute('href', `#${href}`);

        } else {
            a_elm = document.createElement('span');
        }

        // Check for link-affixes.
        for (let affix in Parser.config["link-affixes"]) {
            if (text === affix) {
                // Replace %n if found.
                if (Parser.config["link-affixes"][affix].includes('%n')) {
                    href = href.split(`-${"N".repeat(Parser.variables.length)}`)[0]
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


    /**
     * For a given set of passages, create a Mermaid Flow Chart.
     */
    function _mermaidize(passages, useOriginalName) {
        let connections = [];

        for (let psg of passages) {
            if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
                continue;
            }

            for (let i = 0; i < psg.outboundpsgs.length; i++) {
                let outbound = psg.outboundpsgs[i].replace(/\s/g, '')

                let connect_str = '';
                if (useOriginalName) {
                    connect_str = `${psg.originalName.replace(/\s/g, '')} --> ${outbound}`
                } else {
                    connect_str = `${psg.getAttribute('id').replace(/\s/g, '')} --> ${outbound}`
                }

                if (!connections.includes(connect_str)) {
                    connections.push(connect_str)
                }
            }
        }

        let collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: 'base'
        });
        connections = connections.sort(collator.compare);
        connections.unshift("flowchart LR");
        return connections.join('\n');
    }

    // Returns a Mermaid Flow Chart based on an initial passage.
    function MermaidizeFromPassage(psg) {
        let connections = [];
        let scanned = [psg.getAttribute('name')];
        let to_be_scanned = [];

        if (['front-matter', 'back-matter'].includes(psg.getAttribute('data-placement'))) {
            console.error(`Your 'Start' passage, ${psg.getAttribute('original-name')} must be a body-matter passage.`);
            return false;
        }

        // Initialize loop.
        for (let outbound of psg.outboundpsgs) {
            let connect_str = `${psg.getAttribute('id').replace(/\s/g, '')} --> ${outbound}`

            if (!connections.includes(connect_str)) {
                connections.push(connect_str)
            }

            if (!scanned.includes(outbound)) {
                to_be_scanned.push(outbound)
            }
        }

        while (to_be_scanned.length > 0) {
            let next = to_be_scanned.shift();
            scanned.push(next);

            let nextpsg;
            for (let dpsg of _duplicated_passages) {
                if (dpsg.getAttribute('name') === next) {
                    nextpsg = dpsg;
                    break;
                }
            }

            if (nextpsg === undefined) {
                // BUG Usually this means it's a front-matter or back-matter, like `Author's Note-NN`
                continue;
            }

            if (['front-matter', 'back-matter'].includes(nextpsg.getAttribute('data-placement'))) {
                continue;
            }

            if (psg.outboundpsgs.length <= 0) {
                continue;
            }

            for (let outbound of nextpsg.outboundpsgs) {
                let connect_str = `${nextpsg.getAttribute('id').replace(/\s/g, '')} --> ${outbound}`

                if (!connections.includes(connect_str)) {
                    connections.push(connect_str)
                }

                if (scanned.includes(outbound)) {
                    continue;
                }

                if (to_be_scanned.includes(outbound)) {
                    continue;
                }

                to_be_scanned.push(outbound)
            }
        }


        let collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: 'base'
        });
        connections = connections.sort(collator.compare);
        connections.unshift("flowchart LR");
        return connections.join('\n');
    }

    // Returns an array of all unique passage names from the Mermaid code.
    function getPassagesFromMermaid(text) {
        let passages = text.split(' --> ');
        passages = passages.join('\n');
        passages = passages.split('\n');
        passages.shift(); // remove 'flowchart LR'
        return [...new Set(passages)];
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
        } else if (type.toLowerCase() === "true") {
            for (let i in _truepassages) {
                passages.push(_truepassages[i].cloneNode(true));
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