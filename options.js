function save_options()
{
	var gflag = document.getElementById('gather').checked;

	chrome.storage.sync.set(
		{
			gather: gflag
		}
	)
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
document.getElementById('gather').addEventListener('change', save_options);