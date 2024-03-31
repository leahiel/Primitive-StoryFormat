/***
 * Macros
 */

var Macros = (() => {
    'use strict';

    // Sets the NBSV to True, False, or Null.
    function set(exp, psg) {
        let nbsv = exp.split(' ')[0];
        let val = exp.split(' ')[1];
        
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
            default:a
                // TODO Write error.
        }

        let outboundnbsv = psg.getAttribute('outboundnbsv');
        let idx = Parser.variables.indexOf(nbsv);

        outboundnbsv = outboundnbsv.substring(0, idx) + val + outboundnbsv.substring(idx + 1);
        psg.setAttribute('outboundnbsv', outboundnbsv);
    }

    // Sets the NBSV to null.
    function unset(exp, psg) {
        let nbsv = exp.split(' ')[0];
        let val = 'N'

        let outboundnbsv = psg.getAttribute('outboundnbsv');
        let idx = Parser.variables.indexOf(nbsv);

        outboundnbsv = outboundnbsv.substring(0, idx) + val + outboundnbsv.substring(idx + 1);
        psg.setAttribute('outboundnbsv', outboundnbsv);
    }
    

    /* Object Exports. */
	return Object.freeze(Object.defineProperties({}, {
		set: { value: set },
        unset: { value: unset },
	}));
})();
