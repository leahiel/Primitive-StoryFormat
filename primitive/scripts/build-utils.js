/***********************************************************************************************************************

	This file was minimally pared-down from Thomas Michael Edwards' build-utils.js file, available under the BSD 2-clause 
	"Simplified" License, Copyright © 2020–2021. You may find the original file used for this pared-down verison at:
	https://github.com/tmedwards/sugarcube-2/blob/27903a854b7bedbb9fa60efa33e47c99bab7a359/scripts/build-utils.js

	Thank you to TME for using such an unrestrictive license.

	This version of the file is also governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE 
	file. Copyright © 2023, S. Herring <sfkherrin@yahoo.com>. All rights reserved.

***********************************************************************************************************************/
'use strict';

const _fs     = require('fs');
const _path   = require('path');
const _indent = ' -> ';


function log(message, indent) {
	console.log('%s%s', indent ? indent : _indent, message);
}

function die(message, error) {
	if (error) {
		console.error('error: %s\n[@: %d/%d] Trace:\n', message, error.line, error.col, error.stack);
	}
	else {
		console.error('error: %s', message);
	}

	process.exit(1);
}

function fileExists(pathname) {
	return _fs.existsSync(pathname);
}

function makePath(pathname) {
	const pathBits = _path.normalize(pathname).split(_path.sep);

	for (let i = 0; i < pathBits.length; ++i) {
		const dirPath = i === 0 ? pathBits[i] : pathBits.slice(0, i + 1).join(_path.sep);

		if (!fileExists(dirPath)) {
			_fs.mkdirSync(dirPath);
		}
	}
}

function copyFile(srcFilename, destFilename) {
	const srcPath  = _path.normalize(srcFilename);
	const destPath = _path.normalize(destFilename);
	let buf;

	try {
		buf = _fs.readFileSync(srcPath);
	}
	catch (ex) {
		die(`cannot open file "${srcPath}" for reading (reason: ${ex.message})`);
	}

	try {
		_fs.writeFileSync(destPath, buf);
	}
	catch (ex) {
		die(`cannot open file "${destPath}" for writing (reason: ${ex.message})`);
	}

	return true;
}

function readFileContents(filename) {
	const filepath = _path.normalize(filename);

	try {
		// the replace() is necessary because Node.js only offers binary mode file
		// access, regardless of platform, so we convert DOS-style line terminators
		// to UNIX-style, just in case someone adds/edits a file and gets DOS-style
		// line termination all over it
		return _fs.readFileSync(filepath, { encoding : 'utf8' }).replace(/\r\n/g, '\n');
	}
	catch (ex) {
		die(`cannot open file "${filepath}" for reading (reason: ${ex.message})`);
	}
}

function writeFileContents(filename, data) {
	const filepath = _path.normalize(filename);

	try {
		_fs.writeFileSync(filepath, data, { encoding : 'utf8' });
	}
	catch (ex) {
		die(`cannot open file "${filepath}" for writing (reason: ${ex.message})`);
	}
}

function concatFiles(filenames, callback) {
	const output = filenames.map(filename => {
		const contents = readFileContents(filename);
		return typeof callback === 'function' ? callback(contents, filename) : contents;
	});
	return output.join('\n');
}

exports.log               = log;
exports.die               = die;
exports.fileExists        = fileExists;
exports.makePath          = makePath;
exports.copyFile          = copyFile;
exports.readFileContents  = readFileContents;
exports.writeFileContents = writeFileContents;
exports.concatFiles       = concatFiles;