/***
 * The Parser goes through all the Passages provided by `<tw-passagedata>` and determines 
 * what to do with them.
 * 
 * TODO If the Passage is a config passage, then it applies the config settings.
 * TODO If the Passage is a CSS passage, this it puts the CSS in the correct location.
 * Then, the Parser organizes all remaining Passages by front matter, body matter, and 
 * back matter.
 * 
 * TODO Add a way to shuffle body matter in the processer or outputter stage.
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

	/**
	 * The CSS we got from the EPUBStyle Special Passage.
	 * 
	 *  @type {string} 
	 */
	var epubcss = "";

	/**
	 * The CSS we got from the HTMLStyle Special Passage.
	 * 
	 *  @type {string} 
	 */
	var htmlcss = "";

	/**
	 * The configuration we loaded from StoryConfig 
	 * 
	 * @type {Object}
	 */
	var _configuration = {
		'link-affixes': {
			'': '(turn to %n)',
			'#': '%n',
		},
		'direct-to-epub': false,
		'direct-to-html': false,
	}


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
			// TODO: Use this to title the story in the EPUB, I guess.
			_displayPassage = false;
			_shufflePassage = false;
			_errored = true;
		}

		// StoryData 
		if (_passageTitle.toLowerCase() === "storydata") {
			_displayPassage = false;
			_shufflePassage = false;
			_errored = true;
		}

		// StoryConfig 
		if (_passageTitle.toLowerCase() === "storyconfig") {
			_displayPassage = false;
			_shufflePassage = false;
			// TODO: Apply storyconfig settings. 

			let _user_config = JSON.parse(_passages[i].innerHTML);
			_configuration = mergeDeep(_configuration, _user_config);

			// _hiddenTagNames needs their additional tags. 
			_errored = true;
		}

		// Cover
		if (_passageTitle.toLowerCase() === "cover") {
			_displayPassage = false;
			_shufflePassage = false;
			errorsList.push(`Passage Name \`:: ${_passageTitle}\` is currently reserved for a future version of Primitive. This passage has not been processed.`);
			_errored = true;
		}

		// epubstyle
		if (_passageTitle.toLowerCase() === "epubstyle") {
			epubcss = _passages[i].innerHTML;
			_displayPassage = false;
			_shufflePassage = false;
			_errored = true;
		}

		// htmlstyle
		if (_passageTitle.toLowerCase() === "htmlstyle") {
			htmlcss = _passages[i].innerHTML;
			_displayPassage = false;
			_shufflePassage = false;
			_errored = true;
		}

		if (_errored) {
			continue;
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

					let number = parseInt(_tags[t].split("_")[1]);

					// TODO Test for negative numbers.
					if (!isNaN(number)) {
						if (!_frontMatterPassages.hasOwnProperty(number)) {
							_frontMatterPassages[number] = _passages[i];
							_passages[i].setAttribute("data-placement", "front-matter");

							_shufflePassage = false;
						} else {
							warningsList.push(`The Special Tag 'frontmatter_${number}' is used multiple times. Some _passages with this numbered Special Tag will be shuffled with the rest of the _passages.`);
						}
					} else {
						warningsList.push(`Passage \`:: ${_passageTitle}\` is using the 'frontmatter' Special Tag with an invalid number. Correct format is \`:: ${_passageTitle} [frontmatter_42]\`, where '42' can be replaced with any integer. \n Processing the Passage as a normal passage.`);
					}
				}

				// Back Matter 
				// TODO tags[t].toLowerCase() 
				if (_tags[t].includes("backmatter")) {
					let number = parseInt(_tags[t].split("_")[1]);

					// TODO Test for negative numbers.
					if (!isNaN(number)) {
						if (!_backMatterPassages.hasOwnProperty(number)) {
							_backMatterPassages[number] = _passages[i];
							_passages[i].setAttribute("data-placement", "back-matter");

							_shufflePassage = false;
						} else {
							warningsList.push(`The Special Tag 'backmatter_${number}' is used multiple times. Some _passages with this numbered Special Tag will be shuffled with the rest of the _passages.`);
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

	/** 
	 * Returns a deep clone of _orderedpassages.
	 */
	function getPassages() {
		let passages = [];
		for (let i in _orderedpassages) {
			passages.push(_orderedpassages[i].cloneNode(true));
		}

		return passages;
	}

	/** 
	 * Returns a deep clone of _configuration.
	 */
	function getConfiguration() {
		return structuredClone(_configuration);
	}



	/* Helper Functions */

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
	 * Performs a deep merge of objects and returns new object. Does not modify
	 * objects (immutable) and merges arrays via concatenation.
	 *
	 * @param {...object} objects - Objects to merge
	 * @returns {object} New object with merged key/values
	 * 
	 * Taken from https://stackoverflow.com/a/48218209
	 * CC BY-SA 4.0, no changes.
	 */
	function mergeDeep(...objects) {
		const isObject = obj => obj && typeof obj === 'object';
		
		return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];
			
			if (Array.isArray(pVal) && Array.isArray(oVal)) {
			prev[key] = pVal.concat(...oVal);
			}
			else if (isObject(pVal) && isObject(oVal)) {
			prev[key] = mergeDeep(pVal, oVal);
			}
			else {
			prev[key] = oVal;
			}
		});
		
		return prev;
		}, {});
	}

	/* Object Exports. */
	return Object.freeze(Object.defineProperties({}, {
		passages: { value: getPassages() },
		errors: { value: errorsList },
		warnings: { value: warningsList },
		htmlcss: {value: htmlcss},
		epubcss: {value: epubcss},
		config: {value: getConfiguration() }, // return deep clone
	}));
})();
