var gflag;
var curwindow;

function method_rank(a)
{
	switch(a) {
	case "chrome":
		return 0;
	case "view-source":
		return 1;
	case "https":
		return 2;
	case "http":
		return 2;
	default:
		console.log("Unknown access method " + a);
		return 3;
	}
}

function compare_methods(a, b)
{
	var ar, br;

	ar = method_rank(a);
	br = method_rank(b);

	if (ar < br) {
		return -1;
	}

	if (ar > br) {
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
	if (gflag) {
		/* gather all tabs into a single window */
		var i;
		var wId;
		var tabs;

		tabs = new Array;

		for (i = 0; i < windows.length; i++) {
			var window = windows[i];

			tabs = tabs.concat(window.tabs);
		}

		tabs.sort(compare_tabs);

		wId = curwindow.id;

		for (i = 0; i < tabs.length; i++) {
			chrome.tabs.move(tabs[i].id, {"windowId": wId, "index": i});
		}
	} else {
		/* keep each tab in its own window */
		var i;

		for (i = 0; i < windows.length; i++) {
			var window = windows[i];
			var tabs = window.tabs;
			var j;
			var wId;
			
			wId = window.id;

			tabs.sort(compare_tabs);

			for (j = 0; j < tabs.length; j++) {
				chrome.tabs.move(tabs[j].id, {"windowId": wId, "index": j});
			}
		}
	}	
}

function get_window(window)
{
	var i;
	var newwindow;

	tabs = new Array;
	curwindow = window;

	chrome.windows.getAll({"populate": true}, get_windows);
}

function sort_tabs(tab)
{
	chrome.windows.getCurrent(get_window);
}

function load_settings()
{
	chrome.storage.sync.get(
		{
			gather: false
		}, function(items) {
			gflag = items.gather;
		}
	)
}

document.addEventListener('DOMContentLoaded', load_settings);

chrome.storage.onChanged.addListener(
	function(changes, areaName) {
		load_settings();
	}
);

chrome.browserAction.onClicked.addListener(sort_tabs);
