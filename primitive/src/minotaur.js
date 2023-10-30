/***
 * The Minotaur handles all combinatorial stuff. The Minotaur traverses all the passages from the start. Based on what it sees, it generates new passages and changes links in the passage before hand to redirect to the correct pasages.
 * 
 * It does this by keeping track of every NBSV. As passages set and change NBSV, it splits future passages into two and changes links in them to ensure that they refer to the correct passage.
 * 
 * NBSV's are tracked with in the passage name after the last hyphen as a single character of 'T' [true], 'F' [false], 'N' null.
 *  :: SourceName-TFNTNFNFFT
 * The NBSV's of a passage should remain the same as those in the links they follow, unless if there is a `set` macro that changes an NBSV.
 * 
 * In order to prepare for its journey, the Minotaur also handles all macro calls, determining what it needs to keep track of (NBSV) and what it doesn't.
 */

var Minotaur = (() => {
    /** Nullable Boolean State Variables */
    let NBSVs = {};

    let generated_passages = [];

    /**
     * Loads the NBSV from the array.
     * @param {} array 
     */
    function getNBSVs(array) {
        for (let key in array) {
            NBSVs[array[key]] = null;
        }
    }

    // NOTE Must return an HTML element.
    /**
     * Takes a macro and determines what to do with it.
     * 
     * Passage refers to the Processer Passage, and Minotaur can edit it.
     */
    function receive(string, passage) {
        let regex;
        /* Get type of macro */
        
        // {{title: Name}}
        regex = /{{title:/;
        if (regex.test(string)) {
            let title = /(?<={{title: ).*(?=}})/.exec(string)[0];
            passage.setAttribute('data-title', title);
            return "";
        }

        // {{set NBSV: True/False/Null}}
        regex = /{{set/;
        if (regex.test(string)) {
            let NBSV = /(?<={{set ).*(?=:)/i.exec(string)[0];
            let value = /(?<=: ).*(?=}})/i.exec(string)[0].toLowerCase();
            NBSVs[NBSV] = eval(value); // TODO: Don't use eval. The issue is that the value returns "true", "false", or "null", but I need the values, not the strings. {null: null, false: false, true: true}
            return "";
        }  

        // {{if NBSV: words to be displayed, may even include line breaks}}
        
        // Else
    }

    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
        getNBSVs: { value: getNBSVs },
        send: { value: receive },
    }));
})();