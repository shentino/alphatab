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
