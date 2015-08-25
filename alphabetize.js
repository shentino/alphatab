var tabs;

function compare_tabs(a, b)
{
	/* todo: sort by access method first, like chrome: vs http/https */

	/* Desired sort priority: */
	/* 1: access method (chrome: vs http/https) */
	/* 2: domain name */
	/* 3: rest of url */

	var i;

	var aprefix;
	var bprefix;

	var asuffix;
	var bsuffix;

	asuffix = a.url;
	bsuffix = b.url;

	i = asuffix.indexOf("://");

	if (i == -1) {
		return 1;
	}

	aprefix = asuffix.substr(0, i);
	asuffix = asuffix.substr(i + 3)

	i = bsuffix.indexOf("://");

	if (i == -1) {
		return -1;
	}

	bprefix = bsuffix.substr(0, i);
	bsuffix = bsuffix.substr(i + 3)

	if (aprefix == "chrome" && bprefix != "chrome") {
		return -1;
	}

	if (bprefix == "chrome" && aprefix != "chrome") {
		return 1;
	}

	if (asuffix < bsuffix)
		return -1;
	if (asuffix > bsuffix)
		return 1;
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

		chrome.tabs.move(tabs[i].id, {"windowId": wId, "index": i})
		console.log(tabs[i].url);
	}
}

function sort_tabs(tab)
{
	var i;
	var newwindow;

	tabs = new Array;

	chrome.windows.getAll({populate: true}, get_windows);
}

chrome.browserAction.onClicked.addListener(sort_tabs);

