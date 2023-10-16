/***********************************************************************************************************************

	This file was pared-down from Thomas Michael Edwards' build.js file, available under the BSD 2-clause 
	"Simplified" License, Copyright © 2020–2021. You may find the original file used for this pared-down verison at:
	https://github.com/tmedwards/sugarcube-2/blob/27903a854b7bedbb9fa60efa33e47c99bab7a359/build.js

	Thank you to TME for using such an unrestrictive license.

	This version of the file is also governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE 
	file. Copyright (c) 2023, S. Herring <sfkherrin@yahoo.com>. All rights reserved.

***********************************************************************************************************************/
'use strict';

const CONFIG = {
    js: {
        files: [
            
        ],
        wrap: {
            intro: 'src/templates/intro.js',
            outro: 'src/templates/outro.js'
        }
    },
    css: {
        files: [
            'src/vendor/normalize.css',
            'src/vendor/init-screen.css'
        ]
    },
    libs: [
        // The ordering is important.

        // For Generating EPUBs
        'src/vendor/ejs.min.js',
        'src/vendor/jszip.min.js',
        'src/vendor/jepub.min.js',

        
    ],
    twine2: {
        build: {
            src: 'src/templates/html.tpl',
            dest: 'format.js',
            json: 'src/templates/config.json'
        },
        // copy : [
        // 	{
        // 		src  : 'icon.svg',
        // 		dest : 'build/twine2/sugarcube-2/icon.svg'
        // 	},
        // 	{
        // 		src  : 'LICENSE',
        // 		dest : 'build/twine2/sugarcube-2/LICENSE'
        // 	}
        // ]
    }
}



// NOTICE!
//
// Where string replacements are done, we use the replacement function style to
// disable all special replacement patterns, since some of them may exist within
// the replacement strings—e.g., `$&` within the HTML or JavaScript sources.

const {
    log,
    die,
    fileExists,
    makePath,
    copyFile,
    readFileContents,
    writeFileContents,
    concatFiles
} = require('./scripts/build-utils');

const _path = require('path');
const _opt = require('node-getopt').create([
        ['d', 'debug', 'Keep debugging code; gated by DEBUG symbol.'],
        ['u', 'unminified', 'Suppress minification stages.'],
        ['h', 'help', 'Print this help, then exit.']
    ])
    .bindHelp()
    .parseSystem();

// Build the project.
(async () => {
    console.log('Starting builds...');

    // Create the build ID file, if nonexistent.
    if (!fileExists('.build')) {
        writeFileContents('.build', '0');
    }

    // Get the version info and build metadata.
	const version = (() => {
		const semver = require('semver');
		const { name, version } = require('./package.json'); // relative path must be prefixed ('./')
		const prerelease = semver.prerelease(version);

		return {
			title      : name,
			major      : semver.major(version),
			minor      : semver.minor(version),
			patch      : semver.patch(version),
			prerelease : prerelease && prerelease.length > 0 ? prerelease.join('.') : null,
			build      : Number(readFileContents('.build')) + 1,
			date       : new Date().toISOString(),

			toString() {
				const prerelease = this.prerelease ? `-${this.prerelease}` : '';
				return `${this.major}.${this.minor}.${this.patch}${prerelease}`;
			}
		};
	})();

    // Build for Twine 2.x.
    console.log('\nBuilding Twine 2.x version:');

    // Process the story format templates and write the outfiles.
    projectBuild({
        build: CONFIG.twine2.build,
        version: version,
        libSource: assembleLibraries(CONFIG.libs), // combine the libraries
        appSource: await compileJavaScript(CONFIG.js), // combine and minify the app JS
        cssSource: compileStyles(CONFIG.css), // combine and minify the app CSS

        postProcess(sourceString) {
            // Load the output format.
            let output = require(`./${_path.normalize(this.build.json)}`); // relative path must be prefixed ('./')

            // Merge data into the output format.'
            output = Object.assign(output, {
                description: output.description.replace(
                    /(['"`])\{\{BUILD_VERSION_MAJOR\}\}\1/g,
                    () => this.version.major
                ),
                version: this.version.toString(),
                source: sourceString
            });

            // Wrap the output in the `storyFormat()` function.
            output = `window.storyFormat(${JSON.stringify(output)});`;

            return output;
        }
    });

    // // Process the files that simply need copied into the build.
    // TODO: Uncomment when ready to bundle for production.
    // projectCopy(CONFIG.twine2.copy);
    

    // Update the build ID.
    writeFileContents('.build', String(version.build));
})()
.then(() => console.log('\nBuilds complete!'))
    .catch(reason => console.log('\nERROR:', reason));


/*******************************************************************************
	Utility Functions
*******************************************************************************/
function assembleLibraries(filenames) {
    log('assembling libraries...');

    return concatFiles(filenames, contents => contents.replace(/^\n+|\n+$/g, ''));
}

function compileJavaScript(filenameObj) {
    log('compiling JavaScript...');

    // Join the files.
    let bundle = concatFiles(filenameObj.files);

    bundle = `${readFileContents(filenameObj.wrap.intro)}\n${bundle}\n${readFileContents(filenameObj.wrap.outro)}`;

    return (async source => {
        if (_opt.options.unminified) {
            return [
                `window.DEBUG=${_opt.options.debug || false}`,
                source
            ].join(';\n');
        }

        // Minify the code with Terser.
        const {
            minify
        } = require('terser');
        const minified = await minify(source, {
            compress: {
                global_defs: {
                    DEBUG: _opt.options.debug || false
                }
            },
            mangle: false
        });

        if (minified.error) {
            const {
                message,
                line,
                col,
                pos
            } = minified.error;
            die(`JavaScript minification error: ${message}\n[@: ${line}/${col}/${pos}]`);
        }

        return minified.code;
    })(bundle);
}

function compileStyles(config) {
    log('compiling CSS...');

    const CleanCSS = require('clean-css');

    return concatFiles(config.files, (contents, filename) => {
        let css = contents;

        if (!_opt.options.unminified) {
            css = new CleanCSS({
                    level: 1,
                    compatibility: 'ie9'
                })
                .minify(css)
                .styles;
        }

        const fileSlug = _path.basename(filename, '.css').toLowerCase().replace(/[^0-9a-z]+/g, '-');

        return `<style id="style-${fileSlug}" type="text/css">${css}</style>`;
    });
}

function projectBuild(project) {
    const infile = _path.normalize(project.build.src);
    const outfile = _path.normalize(project.build.dest);

    log(`building: "${outfile}"`);

    // Load the story format template.
    let output = readFileContents(infile);

    // Process the source replacement tokens. (First!)
    output = output.replace(/(['"`])\{\{BUILD_LIB_SOURCE\}\}\1/, () => project.libSource);
    output = output.replace(/(['"`])\{\{BUILD_APP_SOURCE\}\}\1/, () => project.appSource);
    output = output.replace(/(['"`])\{\{BUILD_CSS_SOURCE\}\}\1/, () => project.cssSource);

    // Process the build replacement tokens.
    const prerelease = JSON.stringify(project.version.prerelease);
    const date = JSON.stringify(project.version.date);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_MAJOR\}\}\1/g, () => project.version.major);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_MINOR\}\}\1/g, () => project.version.minor);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_PATCH\}\}\1/g, () => project.version.patch);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_PRERELEASE\}\}\1/g, () => prerelease);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_BUILD\}\}\1/g, () => project.version.build);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_DATE\}\}\1/g, () => date);
    output = output.replace(/(['"`])\{\{BUILD_VERSION_VERSION\}\}\1/g, () => project.version);

    // Post-process hook.
    if (typeof project.postProcess === 'function') {
        output = project.postProcess(output);
    }

    // Write the outfile.
    makePath(_path.dirname(outfile));
    writeFileContents(outfile, output);
}

function projectCopy(fileObjs) {
    fileObjs.forEach(file => {
        const infile = _path.normalize(file.src);
        const outfile = _path.normalize(file.dest);

        log(`copying : "${outfile}"`);

        makePath(_path.dirname(outfile));
        copyFile(infile, outfile);
    });
}