/*
    This file is part of Alphatab.

    A chrome extension for keeping your tabs sorted
    Copyright (C) 2022  Raymond Jennings

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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

function sort_window(window)
{
	var wId;
	var tabs;
	var i;

	wId = window.id;

	tabs = new Array;
	tabs = tabs.concat(window.tabs);
	tabs.sort(compare_tabs);

	for (i = 0; i < tabs.length; i++) {
		chrome.tabs.move(tabs[i].id, {"windowId": wId, "index": i});
	}
}

function sort_tabs(tab)
{
	chrome.windows.getCurrent({"populate": true}, sort_window);
}

chrome.action.onClicked.addListener(sort_tabs);
