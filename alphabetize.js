var tabs;

function compare_methods(a, b)
{
	if (a == "chrome" && b != "chrome") {
		return -1;
	}

	if (a != "chrome" && b == "chrome") {
		return 1;
	}

	return 0;
}

function compare_domains(a, b)
{
	var aparts;
	var bparts;

	aparts = a.split(".").reverse();
	bparts = b.split(".").reverse();

	while (aparts.length && bparts.length) {
		if (bparts.length && !aparts.length) {
			return -1;
		}
		if (aparts.length && !bparts.length) {
			return 1;
		}
		if (aparts[0] < bparts[0]) {
			return -1;
		}
		if (aparts[0] > bparts[0]) {
			return 1;
		}
		aparts.shift();
		bparts.shift();
	}

	return 0;
}

function compare_tabs(a, b)
{
	/* todo: sort by access method first, like chrome: vs http/https */

	/* Desired sort priority: */
	/* 1: access method (chrome: vs http/https) */
	/* 2: domain name */
	/* 3: rest of url */

	var i;
	var c;

	var aprefix;
	var bprefix;

	var asuffix;
	var bsuffix;

	asuffix = a.url;
	bsuffix = b.url;

	/* check access method */

	i = asuffix.indexOf("://");

	if (i == -1) {
		console.log("URL " + a.url + " is missing access method");
		aprefix = "http";
	} else {
		aprefix = asuffix.substr(0, i);
		asuffix = asuffix.substr(i + 3)
	}

	i = bsuffix.indexOf("://");

	if (i == -1) {
		console.log("URL " + b.url + " is missing access method");
		bprefix = "http";
	} else {
		bprefix = bsuffix.substr(0, i);
		bsuffix = bsuffix.substr(i + 3);
	}

	c = compare_methods(aprefix, bprefix);

	if (c != 0) {
		return c;
	}

	/* check domain */

	i = asuffix.indexOf("/");

	if (i == -1) {
		aprefix = asuffix;
		asuffix = "";
	} else {
		aprefix = asuffix.substr(0, i);
		asuffix = asuffix.substr(i);
	}

	i = bsuffix.indexOf("/");

	if (i == -1) {
		bprefix = bsuffix;
		bsuffix = "";
	} else {
		bprefix = bsuffix.substr(0, i);
		bsuffix = bsuffix.substr(i);
	}

	c = compare_domains(aprefix, bprefix);

	if (c != 0) {
		return c;
	}

	/* compare the rest of the url */

	if (asuffix < bsuffix) {
		return -1;
	}

	if (asuffix > bsuffix) {
		return 1;
	}

	/* if they're identical, sort them by where they're already at */

	return (a.index - b.index);
}

function get_windows(windows)
{
	var i;
	var wId;

	for (i = 0; i < windows.length; i++) {
		var window = windows[i];

		tabs = tabs.concat(window.tabs);
	}

	tabs.sort(compare_tabs);

	for (i = 0; i < tabs.length; i++) {
		if (i == 0) {
			wId = tabs[0].windowId;
		}

		chrome.tabs.move(tabs[i].id, {"windowId": wId, "index": i});
	}
}

function sort_tabs(tab)
{
	var i;
	var newwindow;

	tabs = new Array;

	chrome.windows.getAll({"populate": true}, get_windows);
}

chrome.browserAction.onClicked.addListener(sort_tabs);

