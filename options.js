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

var cooling;
var changed;

function cooled_off()
{
	cooling = 0;

	if (changed) {
		document.getElementById('savewarning').innerHTML = " (saving...)";

		save_options();
	} else {
		document.getElementById('savewarning').innerHTML = "";
	}
}

function save_options()
{
	var gflag = document.getElementById('gather').checked;

	cooling = 1;
	changed = 0;

	setTimeout(cooled_off, 1000);
	chrome.storage.sync.set(
		{
			gather: gflag
		}
	)

	document.getElementById('savewarning').innerHTML = " (saved)";
}

function changed_options()
{
	changed = 1;

	if (cooling) {
		document.getElementById('savewarning').innerHTML = " (saving...)";
	} else {
		document.getElementById('savewarning').innerHTML = " (saving...)";

		save_options();
	}
}

function restore_options()
{
	chrome.storage.sync.get(
		{
			gather: false
		}, function(items) {
			document.getElementById('gather').checked = items.gather;
		}
	)
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('gather').addEventListener('change', changed_options);
