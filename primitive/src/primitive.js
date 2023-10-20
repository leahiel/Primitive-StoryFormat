var version = Object.freeze({
	title: 'Primitive',
	major: '{{BUILD_VERSION_MAJOR}}',
	minor: '{{BUILD_VERSION_MINOR}}',
	patch: '{{BUILD_VERSION_PATCH}}',
	prerelease: '{{BUILD_VERSION_PRERELEASE}}',
	build: '{{BUILD_VERSION_BUILD}}',
	date: new Date('{{BUILD_VERSION_DATE}}'),

	toString() {
		'use strict';

		const prerelease = this.prerelease ? `-${this.prerelease}` : '';
		return `${this.major}.${this.minor}.${this.patch}${prerelease}+${this.build}`;
	},

	short() {
		'use strict';

		const prerelease = this.prerelease ? `-${this.prerelease}` : '';
		return `${this.title} (v${this.major}.${this.minor}.${this.patch}${prerelease})`;
	},

	long() {
		'use strict';

		return `${this.title} v${this.toString()} (${this.date.toUTCString()})`;
	}
});

var config = {};

window.Primitive = {};

// Main Function, entry point for the story.
(() => {
	'use strict';

	console.log('Primitive Document loaded; beginning startup.');


	// So I want to get all passages, take out the front and back matter passages, 
	// take out the first passage (I want that as 1), and then put them in order.
	// Also, exclude hidden passages.


	/**
	 * Shuffled Story Passages
	 * 
	 * @type {pid[]}
	 */
	var shuffledIndices = []; 

	/**
	 * Ordered Passages of Back Matter
	 * 
	 * @type {pid[]}
	 */
	var frontIndices = []; 

	/**
	 * An object containing every Front Matter Passage and its supposed place.
	 * 
	 * {
	 * 	Position-in-Front-Matter : PID
	 * }
	 * 
	 * @type {Object.pid}
	 */
	var frontMatterPassages = {};

	/**
	 * Ordered Passages of Front Matter
	 * 
	 * @type {pid[]}
	 */
	var backIndices = []; 

	/**
	 * An object containing every Front Matter Passage and its supposed place.
	 * 
	 * {
	 * 	Position-in-Back-Matter : PID
	 * }
	 * 
	 * @type {Object.pid}
	 */
	var backMatterPassages = {};

	/** 
	 * An object containing every passage. 
	 * 
	 * @type {Object.<Element>}
	 */
	var passages = document.getElementsByTagName("tw-passagedata");

	/** 
	 * Default Special Passage Tags that indication that the Passage should not be shown.
	 * 
	 * @type {string[]}
	 */
	var hiddenTagNames = [
		'hidden',
		'note',
		'notes',
	];

	/**
	 * Every warning we generated while manipulating passages.
	 * 
	 * @type {string[]}
	 */
	var warningsList = [];

	/**
	 * Every error we generated while manipulating passages.
	 * 
	 * @type {string[]}
	 */
	var errorsList = [];


	// DEV
	console.log(passages);

	for (let i = 0; i < passages.length; i++) {
		/**
		 * Should we display the passage?
		 * 
		 * @type {boolean}
		 */
		let displayPassage = true;

		/**
		 * Should we shuffle the passage?
		 * 
		 * @type {boolean}
		 */
		let shufflePassage = true;


		/**
		 * Every tag in the passage we're working on.
		 * 
		 * @type {string[]}
		 */
		let tags = passages[i].getAttribute("tags").split(" ");



		/* Handle Special Passages */

		// Start
		if (passages[i].getAttribute("name").toLowerCase() === "start") {
			// NOTE: Primitive doesn't actually care about the Start passage, however it is required by Twine Compilers.
			// Passage order is dictated by the FrontMatter and BackMatter tags.
			displayPassage = false;
			shufflePassage = false;
		}

		// StoryTitle
		if (passages[i].getAttribute("name").toLowerCase() === "storytitle") {
			// NOTE: Primitive doesn't actually care about the StoryTitle passage, however it is required by Twine Compilers.
			displayPassage = false;
			shufflePassage = false;
		}

		// StoryData
		if (passages[i].getAttribute("name").toLowerCase() === "storydata") {
			displayPassage = false;
			shufflePassage = false;
		}

		// StoryConfig
		if (passages[i].getAttribute("name").toLowerCase() === "storyconfig") {
			displayPassage = false;
			shufflePassage = false;
			// TODO: Apply storyconfig settings.

			// hiddenTagNames needs their additional notes tags.
		}


		/* Handle Special Tags */

		if (displayPassage) {
			for (let t = 0; t < tags.length; t++) {

				let passageTitle = passages[i].getAttribute('name');

				// Front Matter
				// TODO tags[t].toLowerCase()
				if (tags[t].includes("frontmatter")) {
					let order = parseInt(tags[t].split("_")[1]);

					if (!isNaN(order)) {
						if (!frontMatterPassages.hasOwnProperty(order)) {
							frontMatterPassages[order] = i;
							shufflePassage = false;
						} else {
							warningsList.push(`The Special Tag 'frontmatter_${order}' is used multiple times. Some passages with this numbered Special Tag will be shuffled with the rest of the passages.`);
						}
					} else {
						warningsList.push(`Passage \`:: ${passageTitle}\` is using the 'frontmatter' Special Tag with an invalid number. Correct format is \`:: ${passageTitle} [frontmatter_42]\`, where '42' can be replaced with any integer. \n Processing the Passage as a normal passage.`);
					}
				}

				// Back Matter
				// TODO tags[t].toLowerCase()
				if (tags[t].includes("backmatter")) {
					let order = parseInt(tags[t].split("_")[1]);

					if (!isNaN(order)) {
						if (!backMatterPassages.hasOwnProperty(order)) {
							backMatterPassages[order] = i;
							shufflePassage = false;
						} else {
							warningsList.push(`The Special Tag 'backmatter_${order}' is used multiple times. Some passages with this numbered Special Tag will be shuffled with the rest of the passages.`);
						}
					} else {
						warningsList.push(`Passage \`:: ${passageTitle}\` is using the 'backmatter' Special Tag with an invalid number. Correct format is \`:: ${passageTitle} [backmatter_42]\`, where '42' can be replaced with any integer. \n Processing the Passage as a normal passage.`);
					}
				}

				// Hidden Passage
				if (hiddenTagNames.some(tag=> tags[t].includes(tag))) {
					displayPassage = false;
					shufflePassage = false;
				}
			}
		}

		/* Add to be Shuffled . */

		if (displayPassage && shufflePassage) {
			shuffledIndices.push(i)
		}

	}
	shuffle(shuffledIndices);
	console.log(shuffledIndices);
	console.error(errorsList);
	console.warn(warningsList);




	/**
	 * Shuffles the array.
	 * 
	 * @param {any} array 
	 * 
	 * Taken from https://stackoverflow.com/a/2450976
	 * CC BY-SA 4.0, no changes.
	 */
	function shuffle(array) {
		let currentIndex = array.length,  randomIndex;
	  
		// While there remain elements to shuffle.
		while (currentIndex > 0) {
	  
		  // Pick a remaining element.
		  randomIndex = Math.floor(Math.random() * currentIndex);
		  currentIndex--;
	  
		  // And swap it with the current element.
		  [array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
		}
	  
		return array;
	  }
})();