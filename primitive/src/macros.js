/***
 * Macros
 */

// TODO: Consider breaking up this file into Macro and Macros (or MacroLib), wherein Macros are the actual Macros and Macro is the helper stuff.

var Macros = (() => {
    'use strict';

    // Determines if the input is a macro or not.
    function determine(text) {
        // Determine if Macro:
        // if (text.match(/(?:<<)|(?:>>)/gm) === null) {
        if (text.match(/(?:&lt;&lt;)|(?:&gt;&gt;)/gm) === null) {
            // Nope!
            return {
                isOk: false,
                exp: text,
            };
        }

        // Yep!
        // let exp = text.split("<<")[1].split(">>")[0];
        let exp = text.split("&lt;&lt;")[1].split("&gt;&gt;")[0];

        return {
            isOk: true,
            exp: exp,
            macro: exp.split(" ")[0],
            value: exp.substring(exp.indexOf(" ") + 1),
        }
    }

    // Runs the specified Macro.
    function run(macro, psgarr, psg) {
        // Ensure is Macro
        if (!macro.isOk) {
            // Not a macro.
            return macro;
        }

        // Is a macro
        switch (macro.macro) {
            case 'if':
                return iff(macro, psgarr, psg);
            case 'set':
                return set(macro, psgarr, psg);
            case 'unset':
                return unset(macro, psgarr, psg);
            default:
                // The macro is a not a recognized macro.
                // TODO: Pass a warning or error massage to author.

                macro.isOk = false;
                macro.psgarr = psgarr;
                return macro;
        }
    }

    // Runs an if-then-else macro.
    function iff(macro, psgarr, psg) {
        let exp = macro.exp;
        let nbsv = exp.split(' ')[1];
        let solarr = [];

        if (Parser.variables.includes(nbsv)) {
            let varindex = Parser.variables.indexOf(nbsv);

            if (psg.getAttribute("nbsv").charAt(varindex) === "T") {
                // The key matches, remove all elseif and else segments.
                psgarr.shift();

                while (psgarr.length > 0) {
                    let text = psgarr[0];
                    let macro = determine(text);

                    if (!macro.isOk) {
                        // It's not a macro.
                        solarr.push(text);
                        psgarr.shift();
                        continue;
                    }

                    // It's a macro!

                    // `<<if NBSV>>`
                    if (macro.macro === 'if' && (Parser.variables.includes(macro.value))) {
                        // Viable NBSV, ergo we have a nested `<<if>>`.
                        psgarr = iff(macro, psgarr, psg).psgarr;
                        continue;
                    }

                    // `<<elseif NBSV>>`
                    // `<<else>>`
                    if ((macro.macro === 'elseif' && Parser.variables.includes(macro.value)) || macro.macro === 'else') {
                        // Viable NBSV, ergo we have an `<<elseif>>`, or an `<<else>>`.

                        let foundEnd = false;

                        while (!foundEnd) {
                            // Loop through false values until we find the end.
                            let next = psgarr.shift();
                            if (determine(next).macro === 'endif') {
                                foundEnd = true;
                            }
                        }

                        continue;
                    }

                    // `<<endif>>`
                    if (macro.macro === 'endif') {
                        psgarr.shift();
                        break;
                    }

                    psgarr.shift();
                    solarr.push(text);
                }

                return {
                    isOk: true,
                    psgarr: solarr.concat(psgarr),
                }

                // TODO: Background work needs to be done to allow negation of NSBV, i.e. `<<if not NBSV>>`.
            } else {
                // The key does not match, ergo...
                // Remove all between this `<<if>>` and one of [`<<elseif>>` || `<<else>>` || `<<endif>>`]. 
                // If `<<elseif>>`, recursively run this macro. 
                // If `<<else>>`, include that text. 
                // If `<<endif>>`, well, end.

                // Don't add text until we find something that lets us.
                let addText = false;
                // Count nested `<<if>>`s. 
                // We skip them because this is the false route. 
                let neededEnds = 0;

                psgarr.shift();

                while (psgarr.length > 0) {
                    let text = psgarr[0];
                    let macro = determine(text);

                    if (!macro.isOk) {
                        // It's not a macro.
                        if (addText) {
                            solarr.push(text);
                        }

                        psgarr.shift();
                        continue;
                    }

                    // It's a macro!

                    // `<<if NBSV>>`
                    if (macro.macro === 'if' && (Parser.variables.includes(macro.value))) {
                        neededEnds++;

                        psgarr.shift();
                        continue;
                    }

                    // `<<elseif NBSV>>`
                    if (macro.macro === 'elseif' && Parser.variables.includes(macro.value)) {
                        // Edit the `elseif` to be an `if`...
                        psgarr[0] = psgarr[0].replace('elseif', 'if');
                        macro.exp = macro.exp.replace('elseif', 'if');
                        macro.macro = macro.macro.replace('elseif', 'if');

                        // ...then run Macro_if() onto it.
                        psgarr = iff(macro, psgarr, psg).psgarr;
                        solarr.concat(psgarr);

                        break;
                    }

                    // `<<else>>`
                    if (macro.macro === 'else') {
                        addText = true;

                        let foundEnd = false;
                        let else_neededEnds = 0;

                        psgarr.shift();

                        while (!foundEnd) {
                            // Loop through false values until we find the `<<endif>>`` corresponding to this `<<if>>`` statement.
                            let next = psgarr.shift();

                            if (determine(next).macro === 'endif' && else_neededEnds <= 0) {
                                foundEnd = true;
                            } else if (determine(next).macro === 'endif') {
                                else_neededEnds--;
                                continue;
                            } else if (determine(next).macro === 'if') {
                                else_neededEnds++;
                                continue;
                            } else {
                                solarr.push(next);
                            }
                        }

                        break;
                    }


                    // `<<endif>>`
                    if (macro.macro === 'endif') {

                        if (neededEnds <= 0) {
                            psgarr.shift();
                            solarr.push(psgarr.shift());

                            break;
                        }

                        neededEnds--;
                        psgarr.shift();

                        continue;
                    }
                }

                return {
                    isOk: true,
                    psgarr: solarr.concat(psgarr),
                }

            }

        } else {
            // The key does not exist, which means it wasn't set.
            console.error(`NBSV ${nbsv} is not set. Location: ${psg.getAttribute('original-name')}`);
        }

        return {
            isOk: false,
            psgarr: psgarr,
        }
    }

    // Sets the NBSV to True, False, or Null.
    function set(macro, psgarr, psg) {
        let nbsv = macro.exp.split(" ")[1];
        let val = macro.value.split(" ");
        val = val[val.length - 1];
        psgarr.shift(); // remove `<<set NBSV>>`
        macro.psgarr = psgarr;

        if (!Parser.variables.includes(nbsv)) {
            console.error(`NBSV ${nbsv} is not set. Location: ${psg.getAttribute('original-name')}`)
            macro.isOk = false;
            return macro;
        }

        switch (val.toLowerCase()) {
            case 'true':
                val = 'T';
                break;
            case 'false':
                val = 'F';
                break;
            case 'null':
                val = 'N';
                break;
            default:
                console.warn("hi")
                // TODO Write error.
        }

        let outboundnbsv = psg.getAttribute('outboundnbsv');
        let idx = Parser.variables.indexOf(nbsv);

        outboundnbsv = outboundnbsv.substring(0, idx) + val + outboundnbsv.substring(idx + 1);
        psg.setAttribute('outboundnbsv', outboundnbsv);

        return macro;
    }

    // Sets the NBSV to null.
    function unset(macro, psgarr, psg) {
        let nbsv = macro.exp.split(" ")[1];
        let val = 'N'
        psgarr.shift(); // remove `<<unset NBSV>>`

        if (!Parser.variables.includes(nbsv)) {
            console.error(`NBSV ${nbsv} is not set. Location: ${psg.getAttribute('original-name')}`)
            macro.isOk = false;
            return macro;
        }

        let outboundnbsv = psg.getAttribute('outboundnbsv');
        let idx = Parser.variables.indexOf(nbsv);

        outboundnbsv = outboundnbsv.substring(0, idx) + val + outboundnbsv.substring(idx + 1);
        psg.setAttribute('outboundnbsv', outboundnbsv);

        return macro;
    }


    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
        determine: {
            value: determine
        },
        run: {
            value: run
        },
        if: {
            value: iff
        },
        set: {
            value: set
        },
        unset: {
            value: unset
        },

    }));
})();