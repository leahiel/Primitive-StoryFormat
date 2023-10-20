var Config = (() => {
    'use strict';

    // General Settings
    let _title = "Primitive Novel";

    /*******************************************************************************
		Object Exports.
	*******************************************************************************/
    return Object.freeze({
        get title() { return _title; },
    });
    
})();
