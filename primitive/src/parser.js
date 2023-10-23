var Parser = (() => {
    'use strict';

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
	 * An object containing every passage. 
	 * 
	 * @type {Object.<Element>} 
	 */
	var _passages = document.getElementsByTagName("tw-passagedata");

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



		/* Handle Special Passages */

		// Start 
		if (_passageTitle.toLowerCase() === "start") {
			// NOTE: Primitive doesn't actually care about the Start passage, however it is required by Twine Compilers.
			// Passage order is dictated by the FrontMatter and BackMatter tags. 
			_displayPassage = false;
			_shufflePassage = false;
		}

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


		/* Handle Special Tags */

		if (_displayPassage) {
			for (let t = 0; t < _tags.length; t++) {
				// Front Matter 
				// TODO tags[t].toLowerCase() 
				if (_tags[t].includes("frontmatter")) {
					let order = parseInt(_tags[t].split("_")[1]);

					// TODO Test for negative numbers.
					if (!isNaN(order)) {
						if (!_frontMatterPassages.hasOwnProperty(order)) {
							_frontMatterPassages[order] = _passages[i];
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

		if (_displayPassage && _shufflePassage) {
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

	let _orderedpassages = [].concat.apply([], [_frontIndices, _shuffledIndices, _backIndices])


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



    /* Object Exports. */
    return Object.freeze(Object.defineProperties({}, {
		passages : { value : _orderedpassages },
        errors : { value : errorsList },
        warnings : { value : warningsList},
    }));
})();
