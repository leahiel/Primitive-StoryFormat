/***
 * The Parser goes through all the Passages provided by `<tw-passagedata>` and 
 * 
 * First, organizes them by front matter, shuffled matter, and back matter.
 * TODO: Second, performs elementary Passage editing that is common to all output HTML processes.
 * TODO: Then, on demand, it goes through those Passages, and transpiles them into their requested output form.
 */

var Parser = (() => {
    'use strict';

	/** 
	 * An object containing every passage. 
	 * 
	 * @type {Object.<Element>} 
	 */
	var _passages = document.getElementsByTagName('tw-passagedata');

	/** 
	 * Shuffled Story Passages 
	 * 
	 * @type {pid[]} 
	 */
	var _shuffledIndices = [];

	/** 
	 * Ordered Passages of Back Matter 
	 * 
	 * @type {pid[]} 
	 */
	var _frontIndices = [];

	/** 
	 * An object containing every Front Matter Passage and its supposed place. 
	 * 
	 * { 
	 * 	Position-in-Front-Matter : PID 
	 * } 
	 * 
	 * @type {Object.pid} 
	 */
	var _frontMatterPassages = {};

	/** 
	 * Ordered Passages of Front Matter 
	 * 
	 * @type {pid[]} 
	 */
	var _backIndices = [];

	/** 
	 * An object containing every Front Matter Passage and its supposed place. 
	 * 
	 * { 
	 * 	Position-in-Back-Matter : PID 
	 * } 
	 * 
	 * @type {Object.pid} 
	 */
	var _backMatterPassages = {};

	/** 
	 * Default Special Passage Tags that indication that the Passage should not be shown.
	 * 
	 * @type {string[]} 
	 */
	var _hiddenTagNames = [
		'hidden',
		'note',
		'notes',
	];

	/** 
	 * Every warning we generated while manipulating _passages. 
	 * 
	 * @type {string[]} 
	 */
	var warningsList = [];

	/** 
	 * Every error we generated while manipulating _passages. 
	 * 
	 * @type {string[]} 
	 */
	var errorsList = [];


	/* Loop through every Passage and determine if they should be shown or shuffled, and where they belong (Front/Middle/Back). */
	
	for (let i = 0; i < _passages.length; i++) {
		/** 
		 * Should we display the passage? 
		 * 
		 * @type {boolean} 
		 */
		let _displayPassage = true;

		/** 
		 * Should we shuffle the passage? 
		 * 
		 * @type {boolean} 
		 */
		let _shufflePassage = true;

		/** 
		 * Every tag in the passage we're working on. 
		 * 
		 * @type {string[]} 
		 */
		let _tags = _passages[i].getAttribute("tags").split(" ");

		/**
		 * The name of the passage, i.e. `PassageName`" in:
		 * 
		 * `:: PassageName`
		 * 
		 * @type {string}
		 */
		let _passageTitle = _passages[i].getAttribute('name');

		/**
		 * Is there an error with this passage that prevents us from handling it?
		 * 
		 * @type {boolean}
		 */
		let _errored = false;


		/* Handle Special Passages */
		// NOTE: The Start Special Passage is handled after tags are handled.
		
		// StoryTitle 
		if (_passageTitle.toLowerCase() === "storytitle") {
			// NOTE: Primitive doesn't actually care about the StoryTitle passage, however it is required by Twine Compilers.
			_displayPassage = false;
			_shufflePassage = false;
		}

		// StoryData 
		if (_passageTitle.toLowerCase() === "storydata") {
			_displayPassage = false;
			_shufflePassage = false;
		}

		// StoryConfig 
		if (_passageTitle.toLowerCase() === "storyconfig") {
			_displayPassage = false;
			_shufflePassage = false;
			// TODO: Apply storyconfig settings. 

			// _hiddenTagNames needs their additional notes tags. 
		}

		// Cover
		// NOTE: The Cover passage will become available in a future version of Primitive.
		if (_passageTitle.toLowerCase() === "cover") {
			_displayPassage = false;
			_shufflePassage = false;
			errorsList.push(`Passage Name \`:: ${_passageTitle}\` is currently reserved for a future version of Primitive. This passage has not been processed.`);
			_errored = true;
		}



		/* Handle Special Tags */

		if (_displayPassage) {
			for (let t = 0; t < _tags.length; t++) {

				// // TODO An error like this.
				// if (_tags[t].includes("frontmatter") && _tags[t].includes("backmatter")) {
				// 	errorsList.push(`Passage \`:: ${_passageTitle}\` is using the both the 'frontmatter' and 'backmatter' Special Tags. This is not supported. Passage \`:: ${_passageTitle}\` has been excluded for your story.`);
				// 	_errored = true;
				// 	continue;
				// }

				// Front Matter 
				// TODO tags[t].toLowerCase() 
				if (_tags[t].includes("frontmatter")) {

					let order = parseInt(_tags[t].split("_")[1]);

					// TODO Test for negative numbers.
					if (!isNaN(order)) {
						if (!_frontMatterPassages.hasOwnProperty(order)) {
							_frontMatterPassages[order] = _passages[i];
							_passages[i].setAttribute("data-placement", "front-matter");

							_shufflePassage = false;
						} else {
							warningsList.push(`The Special Tag 'frontmatter_${order}' is used multiple times. Some _passages with this numbered Special Tag will be shuffled with the rest of the _passages.`);
						}
					} else {
						warningsList.push(`Passage \`:: ${_passageTitle}\` is using the 'frontmatter' Special Tag with an invalid number. Correct format is \`:: ${_passageTitle} [frontmatter_42]\`, where '42' can be replaced with any integer. \n Processing the Passage as a normal passage.`);
					}
				}

				// Back Matter 
				// TODO tags[t].toLowerCase() 
				if (_tags[t].includes("backmatter")) {
					let order = parseInt(_tags[t].split("_")[1]);

					// TODO Test for negative numbers.
					if (!isNaN(order)) {
						if (!_backMatterPassages.hasOwnProperty(order)) {
							_backMatterPassages[order] = _passages[i];
							_passages[i].setAttribute("data-placement", "back-matter");

							_shufflePassage = false;
						} else {
							warningsList.push(`The Special Tag 'backmatter_${order}' is used multiple times. Some _passages with this numbered Special Tag will be shuffled with the rest of the _passages.`);
						}
					} else {
						warningsList.push(`Passage \`:: ${_passageTitle}\` is using the 'backmatter' Special Tag with an invalid number. Correct format is \`:: ${_passageTitle} [backmatter_42]\`, where '42' can be replaced with any integer. \n Processing the Passage as a normal passage.`);
					}
				}

				// Hidden Passage 
				if (_hiddenTagNames.some(tag => _tags[t].includes(tag))) {
					_displayPassage = false;
					_shufflePassage = false;
				}
			}
		}

		if (_errored) {
			continue;
		}

		// Handle Start Special Passage
		if (_passageTitle.toLowerCase() === "start") {
			_shufflePassage = false;
		}

		if (_displayPassage && _shufflePassage) {
			_passages[i].setAttribute("data-placement", "body-matter");

			_shuffledIndices.push(_passages[i])
		}
	}



	/* Set the order of all _passages. */

	// Front Matter
	let frontkeys = Object.keys(_frontMatterPassages).sort()
	for (let key in frontkeys) {
		_frontIndices.push(_frontMatterPassages[frontkeys[key]]);
	}

	// Shuffled Passages
	shuffle(_shuffledIndices);

	// Back Matter
	let backkeys = Object.keys(_backMatterPassages).sort()
	for (let key in backkeys) {
		_backIndices.push(_backMatterPassages[backkeys[key]]);
	}

	let _orderedpassages = [].concat.apply([], [_frontIndices, _shuffledIndices, _backIndices]);

	/* This is where we will do all of our outer-passage replacing. */
	let _bodymatterindex = ["ErrorPassage"];
	let _shuffledIndex = 1;
	for (let i in _orderedpassages) {
		// Determine Element ID and Prepend Header Text
		if (['front-matter', 'back-matter'].includes(_orderedpassages[i].getAttribute('data-placement'))) {
			// Set the ID of the HTML Element to the name of the Passage if it's in the front or back matter.
			_orderedpassages[i].setAttribute('id', _orderedpassages[i].getAttribute('name'));

		} else if (_orderedpassages[i].getAttribute('data-placement') === 'body-matter') {
			// Set the ID of the HTML Element to an increasing number if it's in the body matter.
			_orderedpassages[i].setAttribute('id', _shuffledIndex);
			_bodymatterindex.push(_orderedpassages[i].getAttribute('name'));

			_shuffledIndex++;
		} else {
			// Somehow, the HTML Element has no 'data-placement' attribute.
			console.error(`Unable to determine data-placement of :: ${_orderedpassages[i].getAttribute('name')}.`)
		}
	}

	/* This is where we will do all of our in-passage processing. */
	for (let i in _orderedpassages) {
		
		let _innerHTML = _orderedpassages[i].innerHTML;
		

		/* Validate HTML tags */
		// TODO: Validate HTML tags here. Only a very limited number of standard HTML tags are allowed as per the EPUB3.3 standard. Most of these are handled by Primitive, to allow the Author to not worry about these. Therefore, if the Author is trying to do something, like add a <script> tag, then we need to ensure that the Author knows that Primitive is not the place for that.

		/* Add Paragraph Tags*/
		// TODO: Add Paragraph Tags from line breaks.

		/* Parse Links */
		let regex = /\[\[(.*?)\]\]/g;
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

		// EPUB Set a span with epub id to link to.


		_orderedpassages[i].innerHTML = _innerHTML;
	}
	

	
	
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
			if (_bodymatterindex.indexOf(href) > 0) {
				// NOTE: _bodymatterindex[0] is the error passage that exists to 
				// shift the array down by one, so we don't care about it.
				a_elm.setAttribute('href', `#${_bodymatterindex.indexOf(href)}`);
			} else {
				a_elm.setAttribute('href', `#${href}`);
			}

			a_elm.innerText = text;

			return a_elm
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



    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
		passages : { value : _orderedpassages },  // TODO: Deep freeze Parser.passages
        errors : { value : errorsList },
        warnings : { value : warningsList},
    }));
})();
