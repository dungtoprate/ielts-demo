// @licstart  The following is the entire license notice for the
//  JavaScript code in this page.
//
// Copyright (C) 2010-2018 Jacob Barkdull
// This file is part of HashOver.
//
// HashOver is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// HashOver is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with HashOver.  If not, see <http://www.gnu.org/licenses/>.
//
// @licend  The above is the entire license notice for the
//  JavaScript code in this page.

"use strict";

// Initial HashOver constructor (constructor.js)
function HashOver (options)
{
	// Reference to this HashOver object
	var hashover = this;

	// Self-executing backend wait loop
	(function backendWait () {
		// Check if we're on the first instance or if HashOver is prepared
		if (HashOver.prepared === true || HashOver.instanceCount === 0) {
			// If so, execute the real constructor
			HashOver.instantiator.call (hashover, options);
		} else {
			// If not, check again in 100 milliseconds
			setTimeout (backendWait, 100);
		}
	}) ();
};

// Constructor to add HashOver methods to
var HashOverConstructor = HashOver;

// Indicator that backend information has been received (constructor.js)
HashOver.prepared = false;

// Initial HashOver instance count (constructor.js)
HashOver.instanceCount = 0;

// Get the current HashOver script tag (script.js)
HashOverConstructor.script = (function ()
{
	// Get various scripts
	var loaderScript = document.getElementById ('hashover-loader');
	var scripts = document.getElementsByTagName ('script');

	// Use either the current script or an identified loader script
	var currentScript = document.currentScript || loaderScript;

	// Otherwise, fallback to the last script encountered
	return currentScript || scripts[scripts.length - 1];
}) ();

// Backend path (backendpath.js)
HashOverConstructor.backendPath = (function () {
	// Get the HashOver script source URL
	var scriptSrc = HashOverConstructor.script.getAttribute ('src');

	// Parse and set HashOver path
	var root = scriptSrc.replace (/\/[^\/]*\/?$/, '');

	return root + '/backend';
}) ();

// Get either the actual page URL or the declared canonical URL (geturl.js)
HashOverConstructor.getURL = function (canonical)
{
	canonical = (canonical !== false);

	// Get the actual page URL
	var url = window.location.href.split ('#')[0];

	// Return the actual page URL if told to
	if (canonical === false) {
		return url;
	}

	// Otherwise, return the declared canonical URL if available
	if (typeof (document.querySelector) === 'function') {
		var canonical = document.querySelector ('link[rel="canonical"]');

		if (canonical !== null && canonical.href !== undefined) {
			url = canonical.href;
		}
	} else {
		// Fallback for old web browsers without querySelector
		var head = document.head || document.getElementsByTagName ('head')[0];
		var links = head.getElementsByTagName ('link');

		for (var i = 0, il = links.length; i < il; i++) {
			if (links[i].rel === 'canonical') {
				url = links[i].href;
				break;
			}
		}
	}
	if(document.getElementById('canon-url')){
      var url_canon = document.getElementById('canon-url');
      if(url_canon.value != null){
          url = url_canon.value;
      }
	}


	return url;
};

// Get the page title (gettitle.js)
HashOverConstructor.getTitle = function ()
{
	return document.title;
};

// Get supported HashOver backend queries from options (getbackendqueries.js)
HashOverConstructor.getBackendQueries = function (options)
{
	// URL queries array
	var queries = [];

	// Check if options parameter is an object
	if (options && options.constructor === Object) {
		// If so, use URL and title if available
		var url = options.url || this.getURL (options.canonical);
		var title = options.title || this.getTitle ();

		// And add thread to request if told to
		if (options.thread !== undefined) {
			queries.push ('thread=' + options.thread);
		}
	} else {
		// If not, get the URL and title from the page
		var url = this.getURL ();
		var title = this.getTitle ();
	}

	// Default backend request POST data
	queries.push ('url=' + encodeURIComponent (url));
	queries.push ('title=' + encodeURIComponent (title));

	return queries;
};

// Real constructor (instantiator.js)
HashOver.instantiator = function (options)
{
	// Get backend queries
	var queries = HashOver.getBackendQueries (options);

	// Check if we're instantiating the first HashOver object
	if (HashOver.prepared !== true) {
		// If so, set query indicating a request for backend information
		queries.push ('prepare=true');
	}

	// Reference to this object
	var hashover = this;

	// Increment HashOver instance count
	HashOver.instanceCount++;

	// Backend request path
	var requestPath = HashOver.backendPath + '/comments-ajax.php';

	// Handle backend request
	this.ajax ('POST', requestPath, queries, function (json) {
		// Handle error messages
		if (json.message !== undefined) {
			hashover.displayError (json);
			return;
		}

		// Set the backend information
		if (HashOver.prepared !== true) {
			// Locales from HashOver backend
			HashOver.prototype.locale = json.locale;

			// Setup information from HashOver back-end
			HashOver.prototype.setup = json.setup;

			// UI HTML from HashOver back-end
			HashOver.prototype.ui = json.ui;

			// Mark HashOver as prepared
			HashOver.prepared = true;
		}

		// Thread information from HashOver back-end
		hashover.instance = json.instance;

		// Backend execution time and memory usage statistics
		hashover.statistics = json.statistics;

		// Initiate HashOver
		hashover.init ();
	}, true);

	// Set instance number to current instance count
	this.instanceNumber = HashOver.instanceCount;

	// Add parent proterty to all prototype objects
	for (var name in this) {
		var value = this[name];

		if (value && value.constructor === Object) {
			value.parent = this;
		}
	}
};

// Execute a callback when the page HTML is parsed and ready (onready.js)
HashOverConstructor.onReady = function (callback)
{
	// Check if document HTML has been parsed
	if (document.readyState === 'interactive') {
		// If so, execute callback immediately
		callback ();
	} else {
		// If not, execute callback after the DOM is parsed
		document.addEventListener ('DOMContentLoaded', function () {
			callback ();
		}, false);
	}
};

// Collection of convenient element functions (elements.js)
HashOverConstructor.prototype.elements = {
	cache: {},

	// Shorthand for Document.getElementById ()
	get: function (id, force, prefix)
	{
		id = (prefix !== false) ? 'hashover-' + id : id;

		if (force === true || !this.cache[id]) {
			this.cache[id] = document.getElementById (id);
		}

		return this.cache[id];
	},

	// Execute callback function if element isn't false
	exists: function (element, callback, prefix)
	{
		if (element = this.get (element, true, prefix)) {
			return callback (element);
		}

		return false;
	},

	// Adds properties to an element
	addProperties: function (element, properties)
	{
		element = element || document.createElement ('span');
		properties = properties || {};

		// Add each property to element
		for (var property in properties) {
			if (properties.hasOwnProperty (property) === false) {
				continue;
			}

			// Property value
			var value = properties[property];

			// If the property is an object add each item to existing property
			if (!!value && value.constructor === Object) {
				this.addProperties (element[property], value);
				continue;
			}

			element[property] = value;
		}

		return element;
	},

	// Creates an element with attributes
	create: function (tagName, attributes)
	{
		tagName = tagName || 'span';
		attributes = attributes || {};

		// Create element
		var element = document.createElement (tagName);

		// Add properties to element
		element = this.addProperties (element, attributes);

		return element;
	},

	// Adds duplicate event listeners to an element
	duplicateProperties: function (element, names, value)
	{
		var properties = {};

		// Construct a properties object with duplicate values
		for (var i = 0, il = names.length; i < il; i++) {
			properties[(names[i])] = value;
		}

		// Add the properties to the object
		return this.addProperties (element, properties);
	}
};

// Get main HashOver UI element (getmainelement.js)
HashOverConstructor.prototype.getMainElement = function (id)
{
	id = id || 'hashover';

	// Attempt to get main HashOver element
	var element = document.getElementById (id);

	// Check if the HashOver element exists
	if (element === null) {
		// If not, get HashOver script tag
		var script = this.constructor.script;

		// Create div tag for HashOver comments to appear in
		element = this.elements.create ('div', { id: id });

		// Place the main HashOver element on the page
		script.parentNode.insertBefore (element, script);
	}

	// Add main HashOver class
	this.classes.add (element, 'hashover');

	// Check if HashOver is prepared
	if (this.constructor.prepared === true) {
		// If so, add class for differentiating desktop and mobile styling
		this.classes.add (element, 'hashover-' + this.setup['device-type']);

		// And add class to indicate user login status
		if (this.setup['user-is-logged-in'] === true) {
			this.classes.add (element, 'hashover-logged-in');
		} else {
			this.classes.add (element, 'hashover-logged-out');
		}
	}

	return element;
};

// Get main HashOver UI element (displayerror.js)
HashOverConstructor.prototype.displayError = function (json, id)
{
	// Get main HashOver element
	var mainElement = this.getMainElement (id);

	// Error message HTML code
	var messageHTML = '<b>HashOver</b>: ' + json.message;

	// Display error in main HashOver element
	mainElement.innerHTML = messageHTML;
};

// Array of JSONP callbacks, starting with default error handler (ajax.js)
HashOverConstructor.jsonp = [
	function (json) { alert (json.message); }
];

// Send HTTP requests using either XMLHttpRequest or JSONP (ajax.js)
HashOverConstructor.prototype.ajax = function (method, path, data, callback, async)
{
	// Check if the browser supports location origin
	if (window.location.origin) {
		// If so, use it as-is
		var origin = window.location.origin;
	} else {
		// If not, construct origin manually
		var protocol = window.location.protocol;
		var hostname = window.location.hostname;
		var port = window.location.port;

		// Final origin
		var origin = protocol + '//' + hostname + (port ? ':' + port : '');
	}

	// Create origin regular expression
	var originRegex = new RegExp ('^' + origin + '/', 'i');

	// Check if script is being remotely accessed
	if (originRegex.test (this.constructor.script.src) === false) {
		// If so, get constructor name
		var source = this.constructor.toString ();
		var constructor = source.match (/function (\w+)/)[1];

		// Push callback into JSONP array
		this.constructor.jsonp.push (callback);

		// Add JSONP callback index and constructor to request data
		data.push ('jsonp=' + (this.constructor.jsonp.length - 1));
		data.push ('jsonp_object=' + constructor || 'HashOver');

		// Create request script
		var request = this.elements.create ('script', {
			src: path + '?' + data.join ('&'),
			async: async
		});

		// And append request script to page
		document.body.appendChild (request);
	} else {
		// If not, create AJAX request
		var request = new XMLHttpRequest ();

		// Set callback as ready state change handler
		request.onreadystatechange = function ()
		{
			// Do nothing if request wasn't successful in a meaningful way
			if (this.readyState !== 4 || this.status !== 200) {
				return;
			}

			// Parse response as JSON
			var json = JSON.parse (this.responseText);

			// Execute callback
			callback.apply (this, [ json ]);
		};

		// And send request
		request.open (method, path, async);
		request.setRequestHeader ('Content-type', 'application/x-www-form-urlencoded');
		request.send (data.join ('&'));
	}
};

// Pre-compiled regular expressions (regex.js)
HashOverConstructor.prototype.regex = new (function () {
	this.urls		= '((http|https|ftp):\/\/[a-z0-9-@:;%_\+.~#?&\/=]+)',
	this.links		= new RegExp (this.urls + '( {0,1})', 'ig'),
	this.thread		= /^(c[0-9r]+)r[0-9\-pop]+$/,
	this.imageTags		= new RegExp ('\\[img\\]<a.*?>' + this.urls + '</a>\\[/img\\]', 'ig'),
	this.EOLTrim		= /^[\r\n]+|[\r\n]+$/g,
	this.paragraphs		= /(?:\r\n|\r|\n){2}/g,
	this.email		= /\S+@\S+/
}) ();

// Trims leading and trailing newlines from a string (eoltrim.js)
HashOverConstructor.prototype.EOLTrim = function (string)
{
	return string.replace (this.regex.EOLTrim, '');
};

// Collection of permalink-related functions (permalinks.js)
HashOverConstructor.prototype.permalinks = {
	// Returns the permalink of a comment's parent
	getParent: function (permalink, flatten)
	{
		flatten = flatten || false;

		var parent = permalink.split ('r');
		var length = parent.length - 1;

		// Limit depth if in stream mode
		if (this.parent.setup['stream-mode'] === true && flatten === true) {
			length = Math.min (this.parent.setup['stream-depth'], length);
		}

		// Check if there is a parent after flatten
		if (length > 0) {
			// If so, remove child from permalink
			parent = parent.slice (0, length);

			// Return parent permalink as string
			return parent.join ('r');
		}

		return null;
	},

	// Find a comment by its permalink
	getComment: function (permalink, comments)
	{
		// Run through all comments
		for (var i = 0, il = comments.length; i < il; i++) {
			// Return comment if its permalink matches
			if (comments[i].permalink === permalink) {
				return comments[i];
			}

			// Recursively check replies when present
			if (comments[i].replies !== undefined) {
				var comment = this.getComment (permalink, comments[i].replies);

				if (comment !== null) {
					return comment;
				}
			}
		}

		// Otherwise return null
		return null;
	},

	// Generate file from permalink
	getFile: function (permalink)
	{
		return permalink.slice(1).replace(/r/g, '-').replace ('-pop', '');
	}
};

// Collection of convenient date and time functions (datetime.js)
HashOverConstructor.prototype.dateTime = {
	offsetRegex: /[0-9]{2}/g,
	dashesRegex: /-/g,

	// Simple PHP date function port
	format: function (format, date)
	{
		format = format || 'DATE_ISO8601';
		date = date || new Date ();

		var hours = date.getHours ();
		var ampm = (hours >= 12) ? 'pm' : 'am';
		var day = date.getDate ();
		var weekDay = date.getDay ();
		var dayName = this.parent.locale['day-names'][weekDay];
		var monthIndex = date.getMonth ();
		var monthName = this.parent.locale['month-names'][monthIndex];
		var hours12 = (hours % 12) ? hours % 12 : 12;
		var minutes = date.getMinutes ();
		var month = monthIndex + 1;
		var offsetHours = (date.getTimezoneOffset() / 60) * 100;
		var offset = ((offsetHours < 1000) ? '0' : '') + offsetHours;
		var offsetColon = offset.match (this.offsetRegex).join (':');
		var offsetPositivity = (offsetHours > 0) ? '-' : '+';
		var seconds = date.getSeconds ();
		var year = date.getFullYear ();

		var characters = {
			a: ampm,
			A: ampm.toUpperCase (),
			d: (day < 10) ? '0' + day : day,
			D: dayName.substr (0, 3),
			F: monthName,
			g: hours12,
			G: hours,
			h: (hours12 < 10) ? '0' + hours12 : hours12,
			H: (hours < 10) ? '0' + hours : hours,
			i: (minutes < 10) ? '0' + minutes : minutes,
			j: day,
			l: dayName,
			m: (month < 10) ? '0' + month : month,
			M: monthName.substr (0, 3),
			n: month,
			N: weekDay + 1,
			O: offsetPositivity + offset,
			P: offsetPositivity + offsetColon,
			s: (seconds < 10) ? '0' + seconds : seconds,
			w: weekDay,
			y: ('' + year).substr (2),
			Y: year
		};

		// Convert dashes to underscores
		var dateConstant = format.replace (this.dashesRegex, '_');

		// Convert constant to uppercase
		dateConstant = dateConstant.toUpperCase ();

		switch (dateConstant) {
			case 'DATE_ATOM':
			case 'DATE_RFC3339':
			case 'DATE_W3C': {
				format = 'Y-m-d\TH:i:sP';
				break;
			}

			case 'DATE_COOKIE': {
				format = 'l, d-M-Y H:i:s';
				break;
			}

			case 'DATE_ISO8601': {
				format = 'Y-m-d\TH:i:sO';
				break;
			}

			case 'DATE_RFC822':
			case 'DATE_RFC1036': {
				format = 'D, d M y H:i:s O';
				break;
			}

			case 'DATE_RFC850': {
				format = 'l, d-M-y H:i:s';
				break;
			}

			case 'DATE_RFC1123':
			case 'DATE_RFC2822':
			case 'DATE_RSS': {
				format = 'D, d M Y H:i:s O';
				break;
			}

			case 'GNOME_DATE': {
				format = 'D M d, g:i A';
				break;
			}

			case 'US_DATE': {
				format = 'm/d/Y';
				break;
			}

			case 'STANDARD_DATE': {
				format = 'Y-m-d';
				break;
			}

			case '12H_TIME': {
				format = 'g:ia';
				break;
			}

			case '24H_TIME': {
				format = 'H:i';
				break;
			}
		}

		var formatParts = format.split ('');

		for (var i = 0, c, il = formatParts.length; i < il; i++) {
			if (i > 0 && formatParts[i - 1] === '\\') {
				formatParts[i - 1] = '';
				continue;
			}

			c = formatParts[i];
			formatParts[i] = characters[c] || c;
		}

		return formatParts.join ('');
	}
};

// Collection of convenient string related functions (strings.js)
HashOverConstructor.prototype.strings = {
	// sprintf specifiers regular expression
	specifiers: /%([cdfs])/g,

	// Curly-brace variable regular expression
	curlyBraces: /(\{\{.+?\}\})/g,

	// Curly-brace variable name regular expression
	curlyNames: /\{\{(.+?)\}\}/,

	// Simplistic JavaScript port of sprintf function in C
	sprintf: function (string, args)
	{
		var string = string || '';
		var args = args || [];
		var count = 0;

		// Replace specifiers with array items
		return string.replace (this.specifiers, function (match, type)
		{
			// Return the original specifier if there isn't an item for it
			if (args[count] === undefined) {
				return match;
			}

			// Switch through each specific type
			switch (type) {
				// Single characters
				case 'c': {
					// Use only the first character
					return args[count++][0];
				}

				// Integer numbers
				case 'd': {
					// Parse item as integer
					return parseInt (args[count++]);
				}

				// Floating point numbers
				case 'f': {
					// Parse item as float
					return parseFloat (args[count++]);
				}

				// Strings
				case 's': {
					// Use string as-is
					return args[count++];
				}
			}
		});
	},

	templatify: function (text)
	{
		var template = text.split (this.curlyBraces);
		var indexes = {};

		for (var i = 0, il = template.length, curly, name; i < il; i++) {
			curly = template[i].match (this.curlyNames);

			if (curly && curly.length > 0) {
				name = curly[1];
				template[i] = '';

				if (indexes[name] !== undefined) {
					indexes[name].push (i);
				} else {
					indexes[name] = [ i ];
				}
			}
		}

		return {
			text: template,
			indexes: indexes
		}
	},

	// Parses an HTML template
	parseTemplate: function (template, data)
	{
		if (!template || !template.indexes || !template.text) {
			return;
		}

		var textClone = template.text.slice ();

		for (var name in data) {
			if (template.indexes[name] === undefined) {
				continue;
			}

			for (var i = 0, il = template.indexes[name].length, index; i < il; i++) {
				index = template.indexes[name][i];
				textClone[index] = data[name];
			}
		}

		return textClone.join ('');
	}
};

// Calls a method that may or may not exist (optionalmethod.js)
HashOverConstructor.prototype.optionalMethod = function (name, args, object)
{
	var method = object ? this[object][name] : this[name];
	var context = object ? this[object] : this;

	// Check if the method exists
	if (method && typeof (method) === 'function') {
		return method.apply (context, args);
	}
};

// Collection of comment parsing functions (comments.js)
HashOverConstructor.prototype.comments = {
	collapsedCount: 0,
	codeOpenRegex: /<code>/i,
	codeTagRegex: /(<code>)([\s\S]*?)(<\/code>)/ig,
	preOpenRegex: /<pre>/i,
	preTagRegex: /(<pre>)([\s\S]*?)(<\/pre>)/ig,
	lineRegex: /(?:\r\n|\r|\n)/g,
	codeTagMarkerRegex: /CODE_TAG\[([0-9]+)\]/g,
	preTagMarkerRegex: /PRE_TAG\[([0-9]+)\]/g,

	// Tags that will have their innerHTML trimmed
	trimTagRegexes: {
		blockquote: {
			test: /<blockquote>/,
			replace: /(<blockquote>)([\s\S]*?)(<\/blockquote>)/ig
		},

		ul: {
			test: /<ul>/,
			replace: /(<ul>)([\s\S]*?)(<\/ul>)/ig
		},

		ol: {
			test: /<ol>/,
			replace: /(<ol>)([\s\S]*?)(<\/ol>)/ig
		}
	},

	// Add comment content to HTML template
	parse: function (comment, parent, collapse, sort, method, popular)
	{
		parent = parent || null;
		collapse = collapse || false;
		sort = sort || false;
		method = method || 'ascending';
		popular = popular || false;

		// Reference to the parent object
		var hashover = this.parent;

		var commentKey = comment.permalink;
		var permalink = 'hashover-' + commentKey;
		var nameClass = 'hashover-name-plain';
		var template = { permalink: commentKey };
		var isReply = (parent !== null);
		var commentDate = comment.date;
		var codeTagCount = 0;
		var codeTags = [];
		var preTagCount = 0;
		var preTags = [];
		var classes = '';
		var replies = '';

		// Text for avatar image alt attribute
		var permatext = commentKey.slice (1);
		    permatext = permatext.split ('r');
		    permatext = permatext.pop ();

		// Trims whitespace from an HTML tag's inner HTML
		function tagTrimmer (fullTag, openTag, innerHTML, closeTag)
		{
			return openTag + hashover.EOLTrim (innerHTML) + closeTag;
		}

		// Get parent comment via permalink
		if (isReply === false && commentKey.indexOf ('r') > -1) {
			// Get the parent comment permalink
			var parentPermalink = hashover.permalinks.getParent (commentKey);

			// Get the parent comment by its permalink
			parent = hashover.permalinks.getComment (parentPermalink, hashover.instance.comments.primary);
			isReply = (parent !== null);
		}

		// Check if this comment is a popular comment
		if (popular === true) {
			// Remove "-pop" from text for avatar
			permatext = permatext.replace ('-pop', '');
		} else {
			// Check if comment is a reply
			if (isReply === true) {
				// Check that comments are being sorted
				if (!sort || method === 'ascending') {
					// Append class to indicate comment is a reply
					classes += ' hashover-reply';
				}
			}

			// Check if comments are being collapsed
			if (hashover.setup['collapses-comments'] !== false) {
				// If so, append class to indicate collapsed comment
				if (hashover.instance['total-count'] > 0) {
					if (collapse === true && this.collapsedCount >= hashover.setup['collapse-limit']) {
						classes += ' hashover-hidden';
					} else {
						this.collapsedCount++;
					}
				}
			}
		}

		// Add avatar image to template
		template.avatar = hashover.strings.parseTemplate (hashover.ui['user-avatar'], {
			src: comment.avatar,
			href: permalink,
			text: permatext
		});

		if (comment.notice === undefined) {
			var name = comment.name || hashover.setup['default-name'];
			var website = comment.website;
			var isTwitter = false;

			// Check if user's name is a Twitter handle
			if (name.charAt (0) === '@') {
				name = name.slice (1);
				nameClass = 'hashover-name-twitter';
				isTwitter = true;
				var nameLength = name.length;

				// Check if Twitter handle is valid length
				if (nameLength > 1 && nameLength <= 30) {
					// Set website to Twitter profile if a specific website wasn't given
					if (website === undefined) {
						website = 'http://twitter.com/' + name;
					}
				}
			}

			// Check whether user gave a website
			if (website !== undefined) {
				if (isTwitter === false) {
					nameClass = 'hashover-name-website';
				}

				// If so, display name as a hyperlink
				var nameElement = hashover.strings.parseTemplate (hashover.ui['name-link'], {
					href: website,
					permalink: commentKey,
					name: name
				});
			} else {
				// If not, display name as plain text
				var nameElement = hashover.strings.parseTemplate (hashover.ui['name-span'], {
					permalink: commentKey,
					name: name
				});
			}

			// Construct thread link
			if ((comment.url && comment.title) !== undefined) {
				template['thread-link'] = hashover.strings.parseTemplate (hashover.ui['thread-link'], {
					url: comment.url,
					title: comment.title
				});
			}

			// Construct parent thread hyperlink
			if (isReply === true) {
				var parentThread = 'hashover-' + parent.permalink;
				var parentName = parent.name || hashover.setup['default-name'];

				// Add thread parent hyperlink to template
				template['parent-link'] = hashover.strings.parseTemplate (hashover.ui['parent-link'], {
					parent: parentThread,
					permalink: commentKey,
					name: parentName
				});
			}

			// Check if the logged in user owns the comment
			if (comment['user-owned'] !== undefined) {
				// If so, append class to indicate comment is from logged in user
				classes += ' hashover-user-owned';

				// Define "Reply" link with original poster title
				var replyTitle = hashover.locale['commenter-tip'];
				var replyClass = 'hashover-no-email';
			} else {
				// Check if commenter is subscribed
				if (comment.subscribed === true) {
					// If so, set subscribed title
					var replyTitle = name + ' ' + hashover.locale['subscribed-tip'];
					var replyClass = 'hashover-has-email';
				} else{
					// If not, set unsubscribed title
					var replyTitle = name + ' ' + hashover.locale['unsubscribed-tip'];
					var replyClass = 'hashover-no-email';
				}
			}

			// Check if the comment is editable for the user
			if (comment['editable'] !== undefined) {
				// If so, add "Edit" hyperlink to template
				template['edit-link'] = hashover.strings.parseTemplate (hashover.ui['edit-link'], {
					href: comment.url || hashover.instance['file-path'],
					permalink: commentKey
				});
			}

			// Add like link and count to template if likes are enabled
			if (hashover.setup['allows-likes'] !== false) {
				hashover.optionalMethod ('addRatings', [
					comment, template, 'like', commentKey
				], 'comments');
			}

			// Add dislike link and count to template if dislikes are enabled
			if (hashover.setup['allows-dislikes'] !== false) {
				hashover.optionalMethod ('addRatings', [
					comment, template, 'dislike', commentKey
				], 'comments');
			}

			// Add name HTML to template
			template.name = hashover.strings.parseTemplate (hashover.ui['name-wrapper'], {
				class: nameClass,
				link: nameElement
			});

			// Check if user timezones is enabled
			if (hashover.setup['uses-user-timezone'] !== false) {
				// If so, get local comment post date
				var postDate = new Date (comment['sort-date'] * 1000);

				// Check if short date format is enabled
				if (hashover.setup['uses-short-dates'] !== false) {
					// If so, get local date
					var localDate = new Date ();

					// Local comment post date to remove time from
					var postDateCopy = new Date (postDate.getTime ());

					// And format local time if the comment was posted today
					if (postDateCopy.setHours (0, 0, 0, 0) === localDate.setHours (0, 0, 0, 0)) {
						commentDate = hashover.strings.sprintf (hashover.locale['today'], [
							hashover.dateTime.format (hashover.setup['time-format'], postDate)
						]);
					}
				} else {
					// If not, format a long local date/time
					commentDate = hashover.dateTime.format (hashover.locale['date-time'], postDate);
				}
			}

			// Append status text to date
			if (comment['status-text'] !== undefined) {
				commentDate += ' (' + comment['status-text'] + ')';
			}

			// Add date from comment as permalink hyperlink to template
			template.date = hashover.strings.parseTemplate (hashover.ui['date-link'], {
				href: comment.url || hashover.instance['file-path'],
				permalink: permalink,
				date: commentDate
			});

			// Add "Reply" hyperlink to template
			template['reply-link'] = hashover.strings.parseTemplate (hashover.ui['reply-link'], {
				href: comment.url || hashover.instance['file-path'],
				permalink: commentKey,
				class: replyClass,
				title: replyTitle
			});

			// Add reply count to template
			if (comment.replies !== undefined) {
				template['reply-count'] = comment.replies.length;

				if (template['reply-count'] > 0) {
					if (template['reply-count'] !== 1) {
						template['reply-count'] += ' ' + hashover.locale['replies'];
					} else {
						template['reply-count'] += ' ' + hashover.locale['reply'];
					}
				}
			}

			// Add HTML anchor tag to URLs
			var body = comment.body.replace (hashover.regex.links, '<a href="$1" rel="noopener noreferrer" target="_blank">$1</a>');

			// Replace [img] tags with external image placeholder if enabled
			body = body.replace (hashover.regex.imageTags, function (fullURL, url) {
				// Check if embedded images are enabled
				if (hashover.setup['allows-images'] !== false) {
					return hashover.optionalMethod ('embedImage', [ url ], 'comments');
				}

				// Convert image URL into an anchor tag
				return '<a href="' + url + '" rel="noopener noreferrer" target="_blank">' + url + '</a>';
			});

			// Parse markdown in comment if enabled
			if (hashover.markdown !== undefined) {
				body = hashover.markdown.parse (body);
			}

			// Check for code tags
			if (this.codeOpenRegex.test (body) === true) {
				// Replace code tags with marker text
				body = body.replace (this.codeTagRegex, function (fullTag, openTag, innerHTML, closeTag) {
					var codeMarker = openTag + 'CODE_TAG[' + codeTagCount + ']' + closeTag;

					codeTags[codeTagCount] = hashover.EOLTrim (innerHTML);
					codeTagCount++;

					return codeMarker;
				});
			}

			// Check for pre tags
			if (this.preOpenRegex.test (body) === true) {
				// Replace pre tags with marker text
				body = body.replace (this.preTagRegex, function (fullTag, openTag, innerHTML, closeTag) {
					var preMarker = openTag + 'PRE_TAG[' + preTagCount + ']' + closeTag;

					preTags[preTagCount] = hashover.EOLTrim (innerHTML);
					preTagCount++;

					return preMarker;
				});
			}

			// Check for various multi-line tags
			for (var trimTag in this.trimTagRegexes) {
				if (this.trimTagRegexes.hasOwnProperty (trimTag) === true
				    && this.trimTagRegexes[trimTag]['test'].test (body) === true)
				{
					// Trim whitespace
					body = body.replace (this.trimTagRegexes[trimTag]['replace'], tagTrimmer);
				}
			}

			// Break comment into paragraphs
			var paragraphs = body.split (hashover.regex.paragraphs);
			var pdComment = '';

			// Wrap comment in paragraph tag
			// Replace single line breaks with break tags
			for (var i = 0, il = paragraphs.length; i < il; i++) {
				pdComment += '<p>' + paragraphs[i].replace (this.lineRegex, '<br>') + '</p>' + hashover.setup['server-eol'];
			}

			// Replace code tag markers with original code tag HTML
			if (codeTagCount > 0) {
				pdComment = pdComment.replace (this.codeTagMarkerRegex, function (marker, number) {
					return codeTags[number];
				});
			}

			// Replace pre tag markers with original pre tag HTML
			if (preTagCount > 0) {
				pdComment = pdComment.replace (this.preTagMarkerRegex, function (marker, number) {
					return preTags[number];
				});
			}

			// Add comment data to template
			template.comment = pdComment;
		} else {
			// Append notice class
			classes += ' hashover-notice ' + comment['notice-class'];

			// Add notice to template
			template.comment = comment.notice;

			// Add name HTML to template
			template.name = hashover.strings.parseTemplate (hashover.ui['name-wrapper'], {
				class: nameClass,
				link: comment.title
			});
		}

		// Comment HTML template
		var html = hashover.strings.parseTemplate (hashover.ui['theme'], template);

		// Recursively parse replies
		if (comment.replies !== undefined) {
			for (var reply = 0, total = comment.replies.length; reply < total; reply++) {
				replies += this.parse (comment.replies[reply], comment, collapse);
			}
		}

		// Wrap comment HTML
		var wrapper = hashover.strings.parseTemplate (hashover.ui['comment-wrapper'], {
			permalink: permalink,
			class: classes,
			html: html + replies
		});

      var user_name = document.getElementById('user_name');
      if(user_name != null){
          document.getElementById('hashover-main-name').value= user_name.value;
          document.getElementById('hashover-main-name').disabled = true;
      }
      var user_mail = document.getElementById('user_mail');
      if(user_mail != null){
          document.getElementById('hashover-main-email').value= user_mail.value;
          document.getElementById('hashover-main-email').disabled = true;
      }


		return wrapper;
	}


};

// Add Like/Dislike link and count to template (addratings.js)
HashOver.prototype.comments.addRatings = function (comment, template, action, commentKey)
{
	// Reference to the parent object
	var hashover = this.parent;

	// The opposite action
	var opposite = (action === 'like') ? 'dislike' : 'like';

	// Check if the comment doesn't belong to the logged in user
	if (comment['user-owned'] === undefined) {
		// Check whether this comment was liked/disliked by the visitor
		if (comment[action + 'd'] !== undefined) {
			// If so, setup indicators that comment was liked/disliked
			var className = 'hashover-' + action + 'd';
			var title = hashover.locale[action + 'd-comment'];
			var text = hashover.locale[action + 'd'];
		} else {
			// If not, setup indicators that comment can be liked/disliked
			var className = 'hashover-' + action;
			var title = hashover.locale[action + '-comment'];
			var text = hashover.locale[action][0];
		}

		// Append class to indicate dislikes are enabled
		if (hashover.setup['allows-' + opposite + 's'] === true) {
			className += ' hashover-' + opposite + 's-enabled';
		}

		// Add like/dislike link to HTML template
		template[action + '-link'] = hashover.strings.parseTemplate (hashover.ui[action + '-link'], {
			permalink: commentKey,
			class: className,
			title: title,
			text: text
		});
	}

	// Check if the comment has been likes/dislikes
	if (comment[action + 's'] !== undefined) {
		// Add likes/dislikes to HTML template
		template[action + 's'] = comment[action + 's'];

		// Get "X Like/Dislike(s)" locale
		var plural = (comment[action + 's'] === 1 ? 0 : 1);
		var count = comment[action + 's'] + ' ' + hashover.locale[action][plural];
	}

	// Add like count to HTML template
	template[action + '-count'] = hashover.strings.parseTemplate (hashover.ui[action + '-count'], {
		permalink: commentKey,
		text: count || ''
	});
};

// Changes a given hyperlink into a "Cancel" hyperlink (cancelswitcher.js)
HashOver.prototype.cancelSwitcher = function (form, link, wrapper, permalink)
{
	// Initial state properties of hyperlink
	var reset = {
		textContent: link.textContent,
		title: link.title,
		onclick: link.onclick
	};

	function linkOnClick ()
	{
		// Remove fields from form wrapper
		wrapper.textContent = '';

		// Reset button
		link.textContent = reset.textContent;
		link.title = reset.title;
		link.onclick = reset.onclick;

		return false;
	}

	// Change hyperlink to "Cancel" hyperlink
	link.textContent = this.locale['cancel'];
	link.title = this.locale['cancel'];

	// This resets the "Cancel" hyperlink to initial state onClick
	link.onclick = linkOnClick;

	// Check if cancel buttons are enabled
	if (this.setup['uses-cancel-buttons'] !== false) {
		// If so, get "Cancel" button
		var cancelButtonId = form + '-cancel-' + permalink;
		var cancelButton = this.elements.get (cancelButtonId, true);

		// Attach event listeners to "Cancel" button
		cancelButton.onclick = linkOnClick;
	}
};

// Returns false if key event is the enter key (formevents.js)
HashOver.prototype.enterCheck = function (event)
{
	return (event.keyCode === 13) ? false : true;
};

// Prevents enter key on inputs from submitting form (formevents.js)
HashOver.prototype.preventSubmit = function (form)
{
	// Get login info inputs
	var infoInputs = form.getElementsByClassName ('hashover-input-info');

	// Set enter key press to return false
	for (var i = 0, il = infoInputs.length; i < il; i++) {
		infoInputs[i].onkeypress = this.enterCheck;
	}
};

// Collection of element class related functions (classes.js)
HashOverConstructor.prototype.classes = new (function () {
	// Check whether browser has classList support
	if (document.documentElement.classList) {
		// If so, wrap relevant functions
		// classList.contains () method
		this.contains = function (element, className)
		{
			return element.classList.contains (className);
		};

		// classList.add () method
		this.add = function (element, className)
		{
			element.classList.add (className);
		};

		// classList.remove () method
		this.remove = function (element, className)
		{
			element.classList.remove (className);
		};
	} else {
		// If not, define fallback functions
		// classList.contains () method
		this.contains = function (element, className)
		{
			if (!element || !element.className) {
				return false;
			}

			var regex = new RegExp ('(^|\\s)' + className + '(\\s|$)');
			return regex.test (element.className);
		};

		// classList.add () method
		this.add = function (element, className)
		{
			if (!element) {
				return false;
			}

			if (!this.contains (element, className)) {
				element.className += (element.className ? ' ' : '') + className;
			}
		};

		// classList.remove () method
		this.remove = function (element, className)
		{
			if (!element || !element.className) {
				return false;
			}

			var regex = new RegExp ('(^|\\s)' + className + '(\\s|$)', 'g');
			element.className = element.className.replace (regex, '$2');
		};
	}
}) ();

// Collection of HashOver message element related functions (messages.js)
HashOver.prototype.messages = {
	timeouts: {},

	// Gets a computed element style by property
	computeStyle: function (element, proterty, type)
	{
		// Check for modern browser support (Mozilla Firefox, Google Chrome)
		if (window.getComputedStyle !== undefined) {
			// If found, get the computed styles for the element
			var computedStyle = window.getComputedStyle (element, null);

			// And get the specific property
			computedStyle = computedStyle.getPropertyValue (proterty);
		} else {
			// Otherwise, assume we're in IE
			var computedStyle = element.currentStyle[proterty];
		}

		// Cast value to specified type
		switch (type) {
			case 'int': {
				computedStyle = computedStyle.replace (/px|em/, '');
				computedStyle = parseInt (computedStyle) || 0;
				break;
			}

			case 'float': {
				computedStyle = computedStyle.replace (/px|em/, '');
				computedStyle = parseFloat (computedStyle) || 0.0;
				break;
			}
		}

		return computedStyle;
	},

	// Gets the client height of a message element
	getHeight: function (element, setChild)
	{
		setChild = setChild || false;

		var firstChild = element.children[0];
		var maxHeight = 80;

		// If so, set max-height style to initial
		firstChild.style.maxHeight = 'initial';

		// Get various computed styles
		var borderTop = this.computeStyle (firstChild, 'border-top-width', 'int');
		var borderBottom = this.computeStyle (firstChild, 'border-bottom-width', 'int');
		var marginBottom = this.computeStyle (firstChild, 'margin-bottom', 'int');
		var border = borderTop + borderBottom;

		// Calculate its client height
		maxHeight = firstChild.clientHeight + border + marginBottom;

		// Set its max-height style as well if told to
		if (setChild === true) {
			firstChild.style.maxHeight = maxHeight + 'px';
		} else {
			firstChild.style.maxHeight = '';
		}

		return maxHeight;
	},

	// Open a message element
	open: function (element)
	{
		// Add classes to indicate message element is open
		this.parent.classes.remove (element, 'hashover-message-animated');
		this.parent.classes.add (element, 'hashover-message-open');

		var maxHeight = this.getHeight (element);
		var firstChild = element.children[0];

		// Reference to the parent object
		var parent = this.parent;

		// Remove class indicating message element is open
		this.parent.classes.remove (element, 'hashover-message-open');

		setTimeout (function () {
			// Add class to indicate message element is open
			parent.classes.add (element, 'hashover-message-open');
			parent.classes.add (element, 'hashover-message-animated');

			// Set max-height styles
			element.style.maxHeight = maxHeight + 'px';
			firstChild.style.maxHeight = maxHeight + 'px';

			// Set max-height style to initial after transition
			setTimeout (function () {
				element.style.maxHeight = 'initial';
				firstChild.style.maxHeight = 'initial';
			}, 150);
		}, 150);
	},

	// Close a message element
	close: function (element)
	{
		// Set max-height style to specific height before transition
		element.style.maxHeight = this.getHeight (element, true) + 'px';

		// Reference to the parent object
		var parent = this.parent;

		setTimeout (function () {
			// Remove max-height style from message elements
			element.children[0].style.maxHeight = '';
			element.style.maxHeight = '';

			// Remove classes indicating message element is open
			parent.classes.remove (element, 'hashover-message-open');
			parent.classes.remove (element, 'hashover-message-error');
		}, 150);
	},

	// Handle message element(s)
	show: function (messageText, type, permalink, error, isReply, isEdit)
	{
		type = type || 'main';
		permalink = permalink || '';
		error = error || false;
		isReply = isReply || false;
		isEdit = isEdit || false;

		// Reference to this object
		var messages = this;

		// Decide which message element to use
		if (isEdit === true) {
			// An edit form message
			var container = this.parent.elements.get ('edit-message-container-' + permalink, true);
			var message = this.parent.elements.get ('edit-message-' + permalink, true);
		} else {
			if (isReply !== true) {
				// The primary comment form message
				var container = this.parent.elements.get ('message-container', true);
				var message = this.parent.elements.get ('message', true);
			} else {
				// Of a reply form message
				var container = this.parent.elements.get ('reply-message-container-' + permalink, true);
				var message = this.parent.elements.get ('reply-message-' + permalink, true);
			}
		}

		if (messageText !== undefined && messageText !== '') {
			// Add message text to element
			message.textContent = messageText;

			// Add class to indicate message is an error if set
			if (error === true) {
				this.parent.classes.add (container, 'hashover-message-error');
			}
		}

		// Add class to indicate message element is open
		this.open (container);

		// Add the comment to message counts
		if (this.timeouts[permalink] === undefined) {
			this.timeouts[permalink] = {};
		}

		// Clear necessary timeout
		if (this.timeouts[permalink][type] !== undefined) {
			clearTimeout (this.timeouts[permalink][type]);
		}

		// Add timeout to close message element after 10 seconds
		this.timeouts[permalink][type] = setTimeout (function () {
			messages.close (container);
		}, 10000);
	}
};

// Handles display of various e-mail warnings (emailvalidator.js)
HashOver.prototype.emailValidator = function (form, subscribe, type, permalink, isReply, isEdit)
{
	if (form.email === undefined) {
		return true;
	}

	// Whether the e-mail form is empty
	if (form.email.value === '') {
		// Return true if user unchecked the subscribe checkbox
		if (this.elements.get (subscribe, true).checked === false) {
			return true;
		}

		// If so, warn the user that they won't receive reply notifications
		if (confirm (this.locale['no-email-warning']) === false) {
			form.email.focus ();
			return false;
		}
	} else {
		// If not, check if the e-mail is valid
		if (this.regex.email.test (form.email.value) === false) {
			// Return true if user unchecked the subscribe checkbox
			if (this.elements.get (subscribe, true).checked === false) {
				form.email.value = '';
				return true;
			}

			// Get message from locales
			var message = this.locale['invalid-email'];

			// Show the message and focus the e-mail input
			this.messages.show (message, type, permalink, true, isReply, isEdit);
			form.email.focus ();

			return false;
		}
	}

	return true;
};

// Validate a comment form e-mail field (validateemail.js)
HashOver.prototype.validateEmail = function (type, permalink, form, isReply, isEdit)
{
	type = type || 'main';
	permalink = permalink || null;
	isReply = isReply || false;
	isEdit = isEdit || false;

	// Subscribe checkbox ID
	var subscribe = type + '-subscribe';

	// Check whether comment is an reply or edit
	if (isReply === true || isEdit === true) {
		// If so, use form subscribe checkbox
		subscribe += '-' + permalink;
	}

	// Validate form fields
	return this.emailValidator (form, subscribe, type, permalink, isReply, isEdit);
};

// Validate a comment form (commentvalidator.js)
HashOver.prototype.commentValidator = function (form, skipComment, isReply)
{
	skipComment = skipComment || false;

	// Check each input field for if they are required
	for (var field in this.setup['field-options']) {
		// Skip other people's prototypes
		if (this.setup['field-options'].hasOwnProperty (field) !== true) {
			continue;
		}

		// Check if the field is required, and that the input exists
		if (this.setup['field-options'][field] === 'required' && form[field] !== undefined) {
			// Check if it has a value
			if (form[field].value === '') {
				// If not, add a class indicating a failed post
				this.classes.add (form[field], 'hashover-emphasized-input');

				// Focus the input
				form[field].focus ();

				// Return error message to display to the user
				return this.strings.sprintf (this.locale['field-needed'], [
					this.locale[field]
				]);
			}

			// Remove class indicating a failed post
			this.classes.remove (form[field], 'hashover-emphasized-input');
		}
	}

	// Check if a comment was given
	if (skipComment !== true && form.comment.value === '') {
		// If not, add a class indicating a failed post
		this.classes.add (form.comment, 'hashover-emphasized-input');

		// Focus the comment textarea
		form.comment.focus ();

		// Error message to display to the user
		var localeKey = (isReply === true) ? 'reply-needed' : 'comment-needed';
		var errorMessage = this.locale[localeKey];

		// Return a error message to display to the user
		return errorMessage;
	}

	return true;
};

// Validate required comment credentials (validatecomment.js)
HashOver.prototype.validateComment = function (skipComment, form, type, permalink, isReply, isEdit)
{
	skipComment = skipComment || false;
	type = type || 'main';
	permalink = permalink || null;
	isReply = isReply || false;
	isEdit = isEdit || false;

	// Validate comment form
	var message = this.commentValidator (form, skipComment, isReply);

	// Display the validator's message
	if (message !== true) {
		this.messages.show (message, type, permalink, true, isReply, isEdit);
		return false;
	}

	// Validate e-mail if user isn't logged in or is editing
	if (this.setup['user-is-logged-in'] === false || isEdit === true) {
		// Return false on any failure
		if (this.validateEmail (type, permalink, form, isReply, isEdit) === false) {
			return false;
		}
	}

	return true;
};

// Posts comments via AJAX (postrequest.js)
HashOver.prototype.postRequest = function (destination, form, button, callback, type, permalink, close, isReply, isEdit)
{
	close = close || null;

	var formElements = form.elements;
	var elementsLength = formElements.length;
	var queries = [];

	// Reference to this object
	var hashover = this;

	// AJAX response handler
	function commentHandler (json)
	{
		// Check if JSON includes a comment
		if (json.comment !== undefined) {
			// If so, execute callback function
			callback.apply (hashover, [ json, permalink, destination, isReply ]);

			// Execute callback function if one was provided
			if (close !== null) {
				close ();
			}

			// Get the comment element by its permalink
			var scrollToElement = hashover.elements.get (json.comment.permalink, true);

			// Scroll comment into view
			scrollToElement.scrollIntoView ({ behavior: 'smooth' });

			// And clear the comment form
			form.comment.value = '';
		} else {
			// If not, display the message return instead
			hashover.messages.show (json.message, type, permalink, (json.type === 'error'), isReply, isEdit);
			return false;
		}

		// Re-enable button on success
		setTimeout (function () {
			button.disabled = false;
		}, 1000);
	}

	// Sends a request to post a comment
	function sendRequest ()
	{
		hashover.ajax ('POST', form.action, queries, commentHandler, true);
	}

	// Get all form input names and values
	for (var i = 0; i < elementsLength; i++) {
		// Skip login/logout input
		if (formElements[i].name === 'login' || formElements[i].name === 'logout') {
			continue;
		}

		// Skip unchecked checkboxes
		if (formElements[i].type === 'checkbox' && formElements[i].checked !== true) {
			continue;
		}

		// Skip delete input
		if (formElements[i].name === 'delete') {
			continue;
		}

		// Add query to queries array
		queries.push (formElements[i].name + '=' + encodeURIComponent (formElements[i].value));
	}

	// Add AJAX query to queries array
	queries.push ('ajax=yes');

	// Check if autologin is enabled and user isn't admin
	if (this.setup['user-is-admin'] !== true
	    && this.setup['uses-auto-login'] !== false)
	{
		// If so, check if the user is logged in
		if (this.setup['user-is-logged-in'] !== true || isEdit === true) {
			// If not, send a login request
			var loginQueries = queries.concat (['login=Login']);

			// Send post comment request after login
			this.ajax ('POST', form.action, loginQueries, sendRequest, true);
		} else {
			// If so, send post comment request normally
			sendRequest ();
		}
	} else {
		// If not, send post comment request
		sendRequest ();
	}

	// Re-enable button after 20 seconds
	setTimeout (function () {
		button.disabled = false;
	}, 20000);

	return false;
};

// For posting comments, both traditionally and via AJAX (postcomment.js)
HashOver.prototype.postComment = function (destination, form, button, callback, type, permalink, close, isReply, isEdit)
{
	type = type || 'main';
	permalink = permalink || '';
	isReply = isReply || false;
	isEdit = isEdit || false;

	// Return false if comment is invalid
	if (this.validateComment (false, form, type, permalink, isReply, isEdit) === false) {
		return false;
	}

	// Disable button
	setTimeout (function () {
		button.disabled = true;
	}, 500);

	// Post by sending an AJAX request if enabled
	if (this.postRequest) {
		return this.postRequest.apply (this, arguments);
	}

	// Re-enable button after 20 seconds
	setTimeout (function () {
		button.disabled = false;
	}, 20000);

	return true;
};

// Add various events to various elements in each comment (addcontrols.js)
HashOverConstructor.prototype.addControls = function (json, popular)
{
	// Reference to this object
	var hashover = this;

	function stepIntoReplies ()
	{
		if (json.replies !== undefined) {
			for (var reply = 0, total = json.replies.length; reply < total; reply++) {
				hashover.addControls (json.replies[reply]);
			}
		}
	}

	if (json.notice !== undefined) {
		stepIntoReplies ();
		return false;
	}

	// Get permalink from JSON object
	var permalink = json.permalink;

	// Set onclick functions for external images
	if (this.setup['allows-images'] !== false) {
		// Get embedded image elements
		var embeddedImgs = document.getElementsByClassName ('hashover-embedded-image');

		for (var i = 0, il = embeddedImgs.length; i < il; i++) {
			embeddedImgs[i].onclick = function ()
			{
				hashover.openEmbeddedImage (this);
			};
		}
	}

	// Check if collapsed comments are enabled
	if (this.setup['collapses-comments'] !== false) {
		// Get thread link of comment
		this.elements.exists ('thread-link-' + permalink, function (threadLink) {
			// Add onClick event to thread hyperlink
			threadLink.onclick = function ()
			{
				hashover.showMoreComments (threadLink, function () {
					var parentThread = permalink.replace (hashover.regex.thread, '$1');
					var scrollToElement = hashover.elements.get (parentThread, true);

					// Scroll to the comment
					scrollToElement.scrollIntoView ({ behavior: 'smooth' });
				});

				return false;
			};
		});
	}

	// Get reply link of comment
	this.elements.exists ('reply-link-' + permalink, function (replyLink) {
		// Add onClick event to "Reply" hyperlink
		replyLink.onclick = function ()
		{
			hashover.replyToComment (permalink);
			return false;
		};
	});

	// Check if the comment is editable for the user
	this.elements.exists ('edit-link-' + permalink, function (editLink) {
		// If so, add onClick event to "Edit" hyperlinks
		editLink.onclick = function ()
		{
			hashover.editComment (json);
			return false;
		};
	});

	// Check if the comment doesn't belong to the logged in user
	if (json['user-owned'] === undefined) {
		// If so, check if likes are enabled
		if (this.setup['allows-likes'] !== false) {
			// If so, check if the like link exists
			this.elements.exists ('like-' + permalink, function (likeLink) {
				// Add onClick event to "Like" hyperlinks
				likeLink.onclick = function ()
				{
					hashover.likeComment ('like', permalink);
					return false;
				};

				// And add "Unlike" mouseover event to liked comments
				if (hashover.classes.contains (likeLink, 'hashover-liked') === true) {
					hashover.mouseOverChanger (likeLink, 'unlike', 'liked');
				}
			});
		}

		// Check if dislikes are enabled
		if (this.setup['allows-dislikes'] !== false) {
			// If so, check if the dislike link exists
			this.elements.exists ('dislike-' + permalink, function (dislikeLink) {
				// Add onClick event to "Dislike" hyperlinks
				dislikeLink.onclick = function ()
				{
					hashover.likeComment ('dislike', permalink);
					return false;
				};
			});
		}
	}

	// Recursively execute this function on replies
	stepIntoReplies ();
};

// For adding new comments to comments array (addcomments.js)
HashOver.prototype.addComments = function (comment, isReply, index)
{
	isReply = isReply || false;
	index = index || null;

	// Check that comment is not a reply
	if (isReply !== true) {
		// If so, add to primary comments
		if (index !== null) {
			this.instance.comments.primary.splice (index, 0, comment);
			return;
		}

		this.instance.comments.primary.push (comment);
		return;
	}

	// If not, fetch parent comment
	var parentPermalink = this.permalinks.getParent (comment.permalink);
	var parent = this.permalinks.getComment (parentPermalink, this.instance.comments.primary);

	// Check if the parent comment exists
	if (parent !== null) {
		// If so, check if comment has replies
		if (parent.replies !== undefined) {
			// If so, add comment to reply array
			if (index !== null) {
				parent.replies.splice (index, 0, comment);
				return;
			}

			parent.replies.push (comment);
			return;
		}

		// If not, create reply array
		parent.replies = [ comment ];
	}

	// Otherwise, add to primary comments
	this.instance.comments.primary.push (comment);
};

// Converts an HTML string to DOM NodeList (htmltonodelist.js)
HashOver.prototype.HTMLToNodeList = function (html)
{
	return this.elements.create ('div', { innerHTML: html }).childNodes;
};

// Increase comment counts (incrementcounts.js)
HashOver.prototype.incrementCounts = function (isReply)
{
	// Count top level comments
	if (isReply === false) {
		this.instance['primary-count']++;
	}

	// Increase all count
	this.instance['total-count']++;
};

// For posting comments (ajaxpost.js)
HashOver.prototype.AJAXPost = function (json, permalink, destination, isReply)
{
	// If there aren't any comments, replace first comment message
	if (this.instance['total-count'] === 0) {
		this.instance.comments.primary[0] = json.comment;
		destination.innerHTML = this.comments.parse (json.comment);
	} else {
		// Add comment to comments array
		this.addComments (json.comment, isReply);

		// Create div element for comment
		var commentNode = this.HTMLToNodeList (this.comments.parse (json.comment));

		// Append comment to parent element
		if (this.setup['stream-mode'] === true && permalink.split('r').length > this.setup['stream-depth']) {
			destination.parentNode.insertBefore (commentNode[0], destination.nextSibling);
		} else {
			destination.appendChild (commentNode[0]);
		}
	}

	// Add controls to the new comment
	this.addControls (json.comment);

	// Update comment count
	this.elements.get ('count').textContent = json.count;
	this.incrementCounts (isReply);
};

// For editing comments (ajaxedit.js)
HashOver.prototype.AJAXEdit = function (json, permalink, destination, isReply)
{
	// Get old comment element nodes
	var comment = this.elements.get (permalink, true);
	var oldNodes = comment.childNodes;
	var oldComment = this.permalinks.getComment (permalink, this.instance.comments.primary);

	// Get new comment element nodes
	var newNodes = this.HTMLToNodeList (this.comments.parse (json.comment));
	    newNodes = newNodes[0].childNodes;

	// Replace old comment with edited comment
	for (var i = 0, il = newNodes.length; i < il; i++) {
		if (typeof (oldNodes[i]) === 'object'
		    && typeof (newNodes[i]) === 'object')
		{
			comment.replaceChild (newNodes[i], oldNodes[i]);
		}
	}

	// Add controls back to the comment
	this.addControls (json.comment);

	// Update old in array comment with edited comment
	for (var attribute in json.comment) {
		oldComment[attribute] = json.comment[attribute];
	}
};

// Attach click event to formatting revealer hyperlinks (formattingonclick.js)
HashOver.prototype.formattingOnclick = function (type, permalink)
{
	permalink = (permalink !== undefined) ? '-' + permalink : '';

	// Reference to this object
	var hashover = this;

	// Get formatting message elements
	var formattingID = type + '-formatting';
	var formatting = this.elements.get (formattingID + permalink, true);
	var formattingMessage = this.elements.get (formattingID + '-message' + permalink, true);

	// Attach click event to formatting revealer hyperlink
	formatting.onclick = function ()
	{
		if (hashover.classes.contains (formattingMessage, 'hashover-message-open')) {
			hashover.messages.close (formattingMessage);
			return false;
		}

		hashover.messages.open (formattingMessage);
		return false;
	}
};

// Displays reply form (replytocomment.js)
HashOver.prototype.replyToComment = function (permalink)
{
	// Reference to this object
	var hashover = this;

	// Get reply link element
	var link = this.elements.get ('reply-link-' + permalink, true);

	// Get file
	var file = this.permalinks.getFile (permalink);

	// Create reply form element
	var form = this.elements.create ('form', {
		id: 'hashover-reply-' + permalink,
		className: 'hashover-reply-form',
		action: this.setup['http-backend'] + '/form-actions.php',
		method: 'post'
	});

	// Place reply fields into form
	form.innerHTML = hashover.strings.parseTemplate (hashover.ui['reply-form'], {
		permalink: permalink,
		file: file
	});

	// Prevent input submission
	this.preventSubmit (form);

	// Add form to page
	var replyForm = this.elements.get ('placeholder-reply-form-' + permalink, true);
	    replyForm.appendChild (form);

	// Change "Reply" link to "Cancel" link
	this.cancelSwitcher ('reply', link, replyForm, permalink);

	// Attach event listeners to "Post Reply" button
	var postReply = this.elements.get ('reply-post-' + permalink, true);

	// Get the element of comment being replied to
	var destination = this.elements.get (permalink, true);

	// Attach click event to formatting revealer hyperlink
	this.formattingOnclick ('reply', permalink);

	// Set onclick and onsubmit event handlers
	this.elements.duplicateProperties (postReply, [ 'onclick', 'onsubmit' ], function () {
		return hashover.postComment (destination, form, this, hashover.AJAXPost, 'reply', permalink, link.onclick, true, false);
	});

	// Focus comment field
	form.comment.focus ();

	return true;
};

// Displays edit form (editcomment.js)
HashOver.prototype.editComment = function (comment)
{
	if (comment['editable'] !== true) {
		return false;
	}

	// Reference to this object
	var hashover = this;

	// Get permalink from comment JSON object
	var permalink = comment.permalink;

	// Get edit link element
	var link = this.elements.get ('edit-link-' + permalink, true);

	// Get file
	var file = this.permalinks.getFile (permalink);

	// Get name and website
	var name = comment.name || '';
	var website = comment.website || '';

	// Get and clean comment body
	var body = comment.body.replace (this.regex.links, '$1');

	// Create edit form element
	var form = this.elements.create ('form', {
		id: 'hashover-edit-' + permalink,
		className: 'hashover-edit-form',
		action: this.setup['http-backend'] + '/form-actions.php',
		method: 'post'
	});

	// Place edit form fields into form
	form.innerHTML = hashover.strings.parseTemplate (hashover.ui['edit-form'], {
		permalink: permalink,
		file: file,
		name: name,
		website: website,
		body: body
	});

	// Prevent input submission
	this.preventSubmit (form);

	// Add edit form to page
	var editForm = this.elements.get ('placeholder-edit-form-' + permalink, true);
	    editForm.appendChild (form);

	// Set status dropdown menu option to comment status
	this.elements.exists ('edit-status-' + permalink, function (status) {
		var statuses = [ 'approved', 'pending', 'deleted' ];

		if (comment.status !== undefined) {
			status.selectedIndex = statuses.indexOf (comment.status);
		}
	});

	// Blank out password field
	setTimeout (function () {
		if (form.password !== undefined) {
			form.password.value = '';
		}
	}, 100);

	// Uncheck subscribe checkbox if user isn't subscribed
	if (comment.subscribed !== true) {
		this.elements.get ('edit-subscribe-' + permalink, true).checked = null;
	}

	// Displays onClick confirmation dialog for comment deletion
	this.elements.get ('edit-delete-' + permalink, true).onclick = function ()
	{
		return confirm (hashover.locale['delete-comment']);
	};

	// Change "Edit" link to "Cancel" link
	this.cancelSwitcher ('edit', link, editForm, permalink);

	// Attach event listeners to "Save Edit" button
	var saveEdit = this.elements.get ('edit-post-' + permalink, true);

	// Get the element of comment being replied to
	var destination = this.elements.get (permalink, true);

	// Attach click event to formatting revealer hyperlink
	this.formattingOnclick ('edit', permalink);

	// Set onclick and onsubmit event handlers
	this.elements.duplicateProperties (saveEdit, [ 'onclick', 'onsubmit' ], function () {
		return hashover.postComment (destination, form, this, hashover.AJAXEdit, 'edit', permalink, link.onclick, false, true);
	});

	return false;
};

// For appending new comments to the thread on page (appendcomments.js)
HashOver.prototype.appendComments = function (comments)
{
	// Run through each comment
	for (var i = 0, il = comments.length; i < il; i++) {
		// Skip existing comments
		if (this.permalinks.getComment (comments[i].permalink, this.instance.comments.primary) !== null) {
			// Check comment's replies
			if (comments[i].replies !== undefined) {
				this.appendComments (comments[i].replies);
			}

			continue;
		}

		// Check if comment is a reply
		var isReply = (comments[i].permalink.indexOf ('r') > -1);

		// Add comment to comments array
		this.addComments (comments[i], isReply, i);

		// Check that comment is not a reply
		if (isReply !== true) {
			// If so, append to primary comments
			var element = this.instance['more-section'];
		} else {
			// If not, append to its parent's element
			var parent = this.permalinks.getParent (comments[i].permalink, true);
			var element = this.elements.get (parent, true) || this.instance['more-section'];
		}

		// Parse comment
		var html = this.comments.parse (comments[i], null, true);

		// Check if we can insert HTML adjacently
		if ('insertAdjacentHTML' in element) {
			// If so, just do so
			element.insertAdjacentHTML ('beforeend', html);
		} else {
			// If not, convert HTML to NodeList
			var comment = this.HTMLToNodeList (html);

			// And append the first node
			element.appendChild (comment[0]);
		}

		// Add controls to the comment
		this.addControls (comments[i]);
	}


};

// For showing more comments, via AJAX or removing a class (hidemorelink.js)
HashOver.prototype.hideMoreLink = function (finishedCallback)
{
	finishedCallback = finishedCallback || null;

	// Reference to this object
	var hashover = this;

	// Add class to hide the more hyperlink
	this.classes.add (this.instance['more-link'], 'hashover-hide-more-link');

	setTimeout (function () {
		// Remove the more hyperlink from page
		if (hashover.instance['sort-section'].contains (hashover.instance['more-link']) === true) {
			hashover.instance['sort-section'].removeChild (hashover.instance['more-link']);
		}

		// Show comment count and sort options
		hashover.elements.get ('count-wrapper').style.display = '';

		// Show popular comments section
		hashover.elements.exists ('popular-section', function (popularSection) {
			popularSection.style.display = '';
		});

		// Get each hidden comment element
		var collapsed = hashover.instance['sort-section'].getElementsByClassName ('hashover-hidden');

		// Remove hidden comment class from each comment
		for (var i = collapsed.length - 1; i >= 0; i--) {
			hashover.classes.remove (collapsed[i], 'hashover-hidden');
		}

		// Execute callback function
		if (finishedCallback !== null) {
			finishedCallback ();
		}
	}, 350);
};

// onClick event for more button (showmorecomments.js)
HashOver.prototype.showMoreComments = function (element, finishedCallback)
{
	finishedCallback = finishedCallback || null;

	// Reference to this object
	var hashover = this;

	// Do nothing if already showing all comments
	if (this.instance['showing-more'] === true) {
		// Execute callback function
		if (finishedCallback !== null) {
			finishedCallback ();
		}

		return false;
	}

	// Check if AJAX is enabled
	if (this.setup['uses-ajax'] !== false) {
		// If so, set request path
		var requestPath = this.setup['http-backend'] + '/load-comments.php';

		// Set URL queries
		var queries = [
			'url=' + encodeURIComponent (this.instance['page-url']),
			'title=' + encodeURIComponent (this.instance['page-title']),
			'thread=' + encodeURIComponent (this.instance['thread-name']),
			'start=' + encodeURIComponent (this.setup['collapse-limit']),
			'ajax=yes'
		];

		// Handle AJAX request return data
		this.ajax ('POST', requestPath, queries, function (json) {
			// Store start time
			var execStart = Date.now ();

			// Display the comments
			hashover.appendComments (json.primary);

			// Remove loading class from element
			hashover.classes.remove (element, 'hashover-loading');

			// Hide the more hyperlink and display the comments
			hashover.hideMoreLink (finishedCallback);

			// Store execution time
			var execTime = Date.now () - execStart;

			// Log execution time and memory usage in JavaScript console
			if (window.console) {
				console.log (hashover.strings.sprintf ('HashOver: front-end %d ms, backend %d ms, %s', [
					execTime, json.statistics['execution-time'], json.statistics['script-memory']
				]));
			}
		}, true);

		// And set class to indicate loading to element
		this.classes.add (element, 'hashover-loading');
	} else {
		// If not, hide the more hyperlink and display the comments
		this.hideMoreLink (finishedCallback);
	}

	// Set all comments as shown
	this.instance['showing-more'] = true;

	return false;
};

// Changes Element.textContent onmouseover and reverts onmouseout (mouseoverchanger.js)
HashOver.prototype.mouseOverChanger = function (element, over, out)
{
	// Reference to this object
	var hashover = this;

	if (over === null || out === null) {
		element.onmouseover = null;
		element.onmouseout = null;

		return false;
	}

	element.onmouseover = function ()
	{
		this.textContent = hashover.locale[over];
	};

	element.onmouseout = function ()
	{
		this.textContent = hashover.locale[out];
	};
};

// For liking comments (likecomment.js)
HashOver.prototype.likeComment = function (action, permalink)
{
	// Reference to this object
	var hashover = this;

	var file = this.permalinks.getFile (permalink);
	var actionLink = this.elements.get (action + '-' + permalink, true);
	var likesElement = this.elements.get (action + 's-' + permalink, true);
	var likePath = this.setup['http-backend'] + '/like.php';

	// Set request queries
	var queries = [
		'url=' + encodeURIComponent (this.instance['page-url']),
		'thread=' + this.instance['thread-name'],
		'comment=' + file,
		'action=' + action
	];

	// When loaded update like count
	this.ajax ('POST', likePath, queries, function (likeResponse) {
		// If a message is returned display it to the user
		if (likeResponse.message !== undefined) {
			alert (likeResponse.message);
			return;
		}

		// If an error is returned display a standard error to the user
		if (likeResponse.error !== undefined) {
			alert ('Error! Something went wrong!');
			return;
		}

		// Get number of likes
		var likesKey = (action !== 'dislike') ? 'likes' : 'dislikes';
		var likes = likeResponse[likesKey] || 0;

		// Change "Like" button title and class
		if (hashover.classes.contains (actionLink, 'hashover-' + action) === true) {
			// Change class to indicate the comment has been liked/disliked
			hashover.classes.add (actionLink, 'hashover-' + action + 'd');
			hashover.classes.remove (actionLink, 'hashover-' + action);
			actionLink.title = (action === 'like') ? hashover.locale['liked-comment'] : hashover.locale['disliked-comment'];
			actionLink.textContent = (action === 'like') ? hashover.locale['liked'] : hashover.locale['disliked'];

			// Add listener to change link text to "Unlike" on mouse over
			if (action === 'like') {
				hashover.mouseOverChanger (actionLink, 'unlike', 'liked');
			}
		} else {
			// Change class to indicate the comment is unliked
			hashover.classes.add (actionLink, 'hashover-' + action);
			hashover.classes.remove (actionLink, 'hashover-' + action + 'd');
			actionLink.title = (action === 'like') ? hashover.locale['like-comment'] : hashover.locale['dislike-comment'];
			actionLink.textContent = (action === 'like') ? hashover.locale['like'][0] : hashover.locale['dislike'][0];

			// Add listener to change link text to "Unlike" on mouse over
			if (action === 'like') {
				hashover.mouseOverChanger (actionLink, null, null);
			}
		}

		if (likes > 0) {
			// Decide if locale is pluralized
			var plural = (likes !== 1) ? 1 : 0;
			var likeLocale = (action !== 'like') ? 'dislike' : 'like';
			var likeCount = likes + ' ' + hashover.locale[likeLocale][plural];

			// Change number of likes; set font weight bold
			likesElement.textContent = likeCount;
			likesElement.style.fontWeight = 'bold';
		} else {
			// Remove like count; set font weight normal
			likesElement.textContent = '';
			likesElement.style.fontWeight = '';
		}
	}, true);
};

// Returns a clone of an object (cloneobject.js)
HashOver.prototype.cloneObject = function (object)
{
	return JSON.parse (JSON.stringify (object));
};

// "Flatten" the comments object (getallcomments.js)
HashOver.prototype.getAllComments = function (comments)
{
	var commentsCopy = this.cloneObject (comments);
	var output = [];

	function descend (comment)
	{
		output.push (comment);

		if (comment.replies !== undefined) {
			for (var reply = 0, total = comment.replies.length; reply < total; reply++) {
				descend (comment.replies[reply]);
			}

			delete comment.replies;
		}
	}

	for (var comment = 0, total = commentsCopy.length; comment < total; comment++) {
		descend (commentsCopy[comment]);
	}

	return output;
};

// Run all comments in array data through comments.parse function (parseall.js)
HashOver.prototype.parseAll = function (comments, element, collapse, popular, sort, method)
{
	popular = popular || false;
	sort = sort || false;
	method = method || 'ascending';

	// Comments HTML
	var html = '';

	// Parse every comment
	for (var i = 0, il = comments.length; i < il; i++) {
		html += this.comments.parse (comments[i], null, collapse, sort, method, popular);
	}

	// Add comments to element's innerHTML
	if ('insertAdjacentHTML' in element) {
		element.insertAdjacentHTML ('beforeend', html);
	} else {
		element.innerHTML = html;
	}

	// Add control events
	for (var i = 0, il = comments.length; i < il; i++) {
		this.addControls (comments[i]);
	}
};

// Comment sorting (sortcomments.js)
HashOver.prototype.sortComments = function (method)
{
	var sortArray = [];
	var defaultName = this.setup['default-name'];

	// Returns the sum number of replies in a comment thread
	function replyPropertySum (comment, callback)
	{
		var sum = 0;

		// Check if there are replies to the current comment
		if (comment.replies !== undefined) {
			// If so, run through them adding up the number of replies
			for (var i = 0, il = comment.replies.length; i < il; i++) {
				sum += replyPropertySum (comment.replies[i], callback);
			}
		}

		// Calculate the sum based on the give callback
		sum += callback (comment);

		return sum;
	}

	// Calculation callback for `replyPropertySum` function
	function replyCounter (comment)
	{
		return (comment.replies) ? comment.replies.length : 0;
	}

	// Calculation callback for `replyPropertySum` function
	function netLikes (comment)
	{
		return (comment.likes || 0) - (comment.dislikes || 0);
	}

	// Sort methods
	switch (method) {
		// Sort all comment in reverse order
		case 'descending': {
			// Get all comments
			var tmpArray = this.getAllComments (this.instance.comments.primary);

			// And reverse the comments
			sortArray = tmpArray.reverse ();

			break;
		}

		// Sort all comments by date
		case 'by-date': {
			sortArray = this.getAllComments (this.instance.comments.primary).sort (function (a, b) {
				if (a['sort-date'] === b['sort-date']) {
					return 1;
				}

				return b['sort-date'] - a['sort-date'];
			});

			break;
		}

		// Sort all comment by net number of likes
		case 'by-likes': {
			sortArray = this.getAllComments (this.instance.comments.primary).sort (function (a, b) {
				a.likes = a.likes || 0;
				b.likes = b.likes || 0;
				a.dislikes = a.dislikes || 0;
				b.dislikes = b.dislikes || 0;

				return (b.likes - b.dislikes) - (a.likes - a.dislikes);
			});

			break;
		}

		// Sort all comment by number of replies
		case 'by-replies': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And sort them by number of replies
			sortArray = tmpArray.sort (function (a, b) {
				var ac = (!!a.replies) ? a.replies.length : 0;
				var bc = (!!b.replies) ? b.replies.length : 0;

				return bc - ac;
			});

			break;
		}

		// Sort threads by the sum of replies to its comments
		case 'by-discussion': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And sort them by the sum of each comment's replies
			sortArray = tmpArray.sort (function (a, b) {
				var replyCountA = replyPropertySum (a, replyCounter);
				var replyCountB = replyPropertySum (b, replyCounter);

				return replyCountB - replyCountA;
			});

			break;
		}

		// Sort threads by the sum of likes to it's comments
		case 'by-popularity': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And sort them by the sum of each comment's net likes
			sortArray = tmpArray.sort (function (a, b) {
				var likeCountA = replyPropertySum (a, netLikes);
				var likeCountB = replyPropertySum (b, netLikes);

				return likeCountB - likeCountA;
			});

			break;
		}

		// Sort all comment by the commenter names
		case 'by-name': {
			// Get all comments
			var tmpArray = this.getAllComments (this.instance.comments.primary);

			// And sort them alphabetically by the commenter names
			sortArray = tmpArray.sort (function (a, b) {
				var nameA = (a.name || defaultName).toLowerCase ();
				var nameB = (b.name || defaultName).toLowerCase ();

				nameA = (nameA.charAt (0) === '@') ? nameA.slice (1) : nameA;
				nameB = (nameB.charAt (0) === '@') ? nameB.slice (1) : nameB;

				if (nameA > nameB) {
					return 1;
				}

				if (nameA < nameB) {
					return -1;
				}

				return 0;
			});

			break;
		}

		// Sort threads in reverse order
		case 'threaded-descending': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And reverse the comments
			sortArray = tmpArray.reverse ();

			break;
		}

		// Sort threads by date
		case 'threaded-by-date': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And sort them by date
			sortArray = tmpArray.sort (function (a, b) {
				if (a['sort-date'] === b['sort-date']) {
					return 1;
				}

				return b['sort-date'] - a['sort-date'];
			});

			break;
		}

		// Sort threads by net likes
		case 'threaded-by-likes': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And sort them by the net number of likes
			sortArray = tmpArray.sort (function (a, b) {
				a.likes = a.likes || 0;
				b.likes = b.likes || 0;
				a.dislikes = a.dislikes || 0;
				b.dislikes = b.dislikes || 0;

				return (b.likes - b.dislikes) - (a.likes - a.dislikes);
			});

			break;
		}

		// Sort threads by commenter names
		case 'threaded-by-name': {
			// Clone the primary comments
			var tmpArray = this.cloneObject (this.instance.comments.primary);

			// And sort them alphabetically by the commenter names
			sortArray = tmpArray.sort (function (a, b) {
				var nameA = (a.name || defaultName).toLowerCase ();
				var nameB = (b.name || defaultName).toLowerCase ();

				nameA = (nameA.charAt (0) === '@') ? nameA.slice (1) : nameA;
				nameB = (nameB.charAt (0) === '@') ? nameB.slice (1) : nameB;

				if (nameA > nameB) {
					return 1;
				}

				if (nameA < nameB) {
					return -1;
				}

				return 0;
			});

			break;
		}

		// By default simply use the primary comments as-is
		default: {
			sortArray = this.instance.comments.primary;
			break;
		}
	}

	// Parse the sorted comments
	this.parseAll (sortArray, this.instance['sort-section'], false, false, true, method);
};

// Appends HashOver theme CSS to page head (appendcss.js)
HashOverConstructor.prototype.appendCSS = function (id)
{
	id = id || 'hashover';

	// Get the page head
	var head = document.head || document.getElementsByTagName ('head')[0];

	// Get head link tags
	var links = head.getElementsByTagName ('link');

	// Theme CSS regular expression
	var themeRegex = new RegExp (this.setup['theme-css']);

	// Get the main HashOver element
	var mainElement = this.getMainElement (id);

	// Do nothing if the theme StyleSheet is already in the <head>
	for (var i = 0, il = links.length; i < il; i++) {
		if (themeRegex.test (links[i].href) === true) {
			// Hide HashOver if the theme isn't loaded
			if (links[i].loaded === false) {
				mainElement.style.display = 'none';
			}

			// And do nothing else
			return;
		}
	}

	// Otherwise, create <link> element for theme StyleSheet
	var css = this.elements.create ('link', {
		rel: 'stylesheet',
		href: this.setup['theme-css'],
		type: 'text/css',
		loaded: false
	});

	// Check if the browser supports CSS load events
	if (css.onload !== undefined) {
		// CSS load and error event handler
		var onLoadError = function ()
		{
			// Get all HashOver class elements
			var hashovers = document.getElementsByClassName ('hashover');

			// Show all HashOver class elements
			for (var i = 0, il = hashovers.length; i < il; i++) {
				hashovers[i].style.display = '';
			}

			// Set CSS as loaded
			css.loaded = true;
		};

		// Hide HashOver
		mainElement.style.display = 'none';

		// And and CSS load and error event listeners
		css.addEventListener ('load', onLoadError, false);
		css.addEventListener ('error', onLoadError, false);
	}

	// Append theme StyleSheet <link> element to page <head>
	head.appendChild (css);
};

// Creates the "Show X Other Comments" button (uncollapsecommentslink.js)
HashOver.prototype.uncollapseCommentsLink = function ()
{
	// Check whether there are more than the collapse limit
	if (this.instance['total-count'] > this.setup['collapse-limit']) {
		// Create element for the comments
		this.instance['more-section'] = this.elements.create ('div', {
			className: 'hashover-more-section'
		});

		// If so, create "More Comments" hyperlink
		this.instance['more-link'] = this.elements.create ('a', {
			href: '#',
			className: 'hashover-more-link',
			title: this.instance['more-link-text'],
			textContent: this.instance['more-link-text'],

			onclick: function () {
				return hashover.showMoreComments (this);
			}
		});

		// Add more button link to sort div
		this.instance['sort-section'].appendChild (this.instance['more-section']);

		// Add more button link to sort div
		this.instance['sort-section'].appendChild (this.instance['more-link']);

		// And consider comments collapsed
		this.instance['showing-more'] = false;
	} else {
		// If not, consider all comments shown
		this.instance['showing-more'] = true;
	}
};

// HashOver UI initialization process (init.js)
HashOver.prototype.init = function ()
{
	// Store start time
	this.execStart = Date.now ();

	// Reference to this object
	var hashover = this;

	// Get the main HashOver element
	var mainElement = this.getMainElement ();

	// Form events that get the same listeners
	var formEvents = [ 'onclick', 'onsubmit' ];

	// Current page URL without the hash
	var pageURL = window.location.href.split ('#')[0];

	// Current page URL hash
	var pageHash = window.location.hash.substr (1);

	// Scrolls to a specified element
	function scrollToElement (id)
	{
		hashover.elements.exists (id, function (element) {
			element.scrollIntoView ({ behavior: 'smooth' });
		}, false);
	}

	// Callback for scrolling a comment into view on page load
	function scrollCommentIntoView ()
	{
		// Check if the comments are collapsed
		if (hashover.setup['collapses-comments'] !== false) {
			// Check if comment exists on the page
			var linkedHidden = hashover.elements.exists (pageHash, function (comment) {
				// Check if the comment is visable
				if (hashover.classes.contains (comment, 'hashover-hidden') === false) {
					// If so, scroll to the comment
					scrollToElement (pageHash);
					return true;
				}

				return false;
			}, false);

			// Check if the linked comment is hidden
			if (linkedHidden === false) {
				// If not, show more comments
				hashover.showMoreComments (hashover.instance['more-link'], function () {
					// Then scroll to comment
					scrollToElement (pageHash);
				});
			}
		} else {
			// If not, scroll to comment normally
			scrollToElement (pageHash);
		}
	}

	// Callback for scrolling a comment into view on page load
	function prepareScroll ()
	{
		// Scroll the main HashOver element into view
		if (pageHash.match (/comments|hashover/)) {
			scrollToElement (pageHash);
		}

		// Check if we're scrolling to a comment
		if (pageHash.match (/hashover-c[0-9]+r*/)) {
			// If so, check if the user interface is collapsed
			if (hashover.setup['collapses-interface'] !== false) {
				// If so, scroll to it after uncollapsing the interface
				hashover.uncollapseInterface (scrollCommentIntoView);
			} else {
				// If not, scroll to the comment directly
				scrollCommentIntoView ();
			}
		}

		// Open the message element if there's a message
		if (hashover.elements.get ('message').textContent !== '') {
			hashover.messages.show ();
		}
	}

	// Page load event handler
	function onLoad ()
	{
		setTimeout (prepareScroll, 500);
	}

	// Append theme CSS if enabled
	this.optionalMethod ('appendCSS');

	// Put number of comments into "hashover-comment-count" identified HTML element
	if (this.instance['total-count'] !== 0) {
		this.elements.exists ('comment-count', function (countElement) {
			countElement.textContent = hashover.instance['total-count'];
		});

		// Append RSS feed if enabled
		this.optionalMethod ('appendRSS');
	}

	// Add initial HTML to page
	if ('insertAdjacentHTML' in mainElement) {
		mainElement.textContent = '';
		mainElement.insertAdjacentHTML ('beforeend', this.instance['initial-html']);
	} else {
		mainElement.innerHTML = this.instance['initial-html'];
	}

	// Add main HashOver element to this HashOver instance
	this.instance['main-element'] = mainElement;

	// Templatify UI HTML strings
	for (var element in this.ui) {
		this.ui[element] = this.strings.templatify (this.ui[element]);
	}

	// Get sort div element
	this.instance['sort-section'] = this.elements.get ('sort-section');

	// Display most popular comments
	this.elements.exists ('top-comments', function (topComments) {
		if (hashover.instance.comments.popular[0] !== undefined) {
			hashover.parseAll (hashover.instance.comments.popular, topComments, false, true);
		}
	});

	// Add initial event handlers
	this.parseAll (this.instance.comments.primary, this.instance['sort-section'], this.setup['collapses-comments']);

	// Create uncollapse UI hyperlink if enabled
	this.optionalMethod ('uncollapseInterfaceLink');

	// Create uncollapse comments hyperlink if enabled
	this.optionalMethod ('uncollapseCommentsLink');

	// Attach click event to formatting revealer hyperlink
	this.formattingOnclick ('main');

	// Get some various form elements
	var postButton = this.elements.get ('post-button');
	var formElement = this.elements.get ('form');

	// Set onclick and onsubmit event handlers
	this.elements.duplicateProperties (postButton, formEvents, function () {
		return hashover.postComment (hashover.instance['sort-section'], formElement, postButton, hashover.AJAXPost);
	});

	// Check if login is enabled
	if (this.setup['allows-login'] !== false) {
		// Attach event listeners to "Login" button
		if (this.setup['user-is-logged-in'] !== true) {
			var loginButton = this.elements.get ('login-button');

			// Set onclick and onsubmit event handlers
			this.elements.duplicateProperties (loginButton, formEvents, function () {
				return hashover.validateComment (true, formElement);
			});
		}
	}

	// Five method sort
	this.elements.exists ('sort-select', function (sortSelect) {
		sortSelect.onchange = function ()
		{
			// Check if the comments are collapsed
			if (hashover.setup['collapses-comments'] !== false) {
				// If so, get the select div
				var sortSelectDiv = hashover.elements.get ('sort');

				// And uncollapse the comments before sorting
				hashover.showMoreComments (sortSelectDiv, function () {
					hashover.instance['sort-section'].textContent = '';
					hashover.sortComments (sortSelect.value);
				});
			} else {
				// If not, sort the comments normally
				hashover.instance['sort-section'].textContent = '';
				hashover.sortComments (sortSelect.value);
			}
		};
	});

	// Display reply or edit form when the proper URL queries are set
	if (pageURL.match (/hashover-(reply|edit)=/)) {
		var permalink = pageURL.replace (/.*?hashover-(edit|reply)=(c[0-9r\-pop]+).*?/, '$2');

		if (!pageURL.match ('hashover-edit=')) {
			// Check if the comments are collapsed
			if (hashover.setup['collapses-comments'] !== false) {
				// If so, show more comments
				this.showMoreComments (this.instance['more-link'], function () {
					// Then display and scroll to reply form
					hashover.replyToComment (permalink);
					scrollToElement (pageHash);
				});
			} else {
				// If not, display and scroll to reply form
				this.replyToComment (permalink);
				scrollToElement (pageHash);
			}
		} else {
			var isPop = permalink.match ('-pop');
			var comments = (isPop) ? this.instance.comments.popular : this.instance.comments.primary;

			// Check if the comments are collapsed
			if (hashover.setup['collapses-comments'] !== false) {
				// If so, show more comments
				this.showMoreComments (this.instance['more-link'], function () {
					// Then display and scroll to edit form
					hashover.editComment (hashover.permalinks.getComment (permalink, comments));
					scrollToElement (pageHash);
				});
			} else {
				// If not, display and scroll to edit form
				this.editComment (this.permalinks.getComment (permalink, comments));
				scrollToElement (pageHash);
			}
		}
	}

	// Store end time
	this.execEnd = Date.now ();

	// Store execution time
	this.execTime = this.execEnd - this.execStart;

	// Log execution time and memory usage in JavaScript console
	if (window.console) {
		console.log (this.strings.sprintf ('HashOver: front-end %d ms, backend %d ms, %s', [
			this.execTime, this.statistics['execution-time'], this.statistics['script-memory']
		]));
	}

	// Page onload compatibility wrapper
	if (window.addEventListener) {
		// Rest of the world
		window.addEventListener ('load', onLoad, false);
	} else {
		// IE ~8
		window.attachEvent ('onload', onLoad);
	}

	// Execute page load event handler manually
	onLoad ();
};

// Instantiate after the DOM is parsed
HashOver.onReady (function () {
	window.hashover = new HashOver ();
});

/*

	HashOver Statistics

	Execution Time     : 0.84186 ms
	Script Memory Peak : 0.67 MiB
	System Memory Peak : 2 MiB

*/