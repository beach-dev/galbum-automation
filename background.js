var photoDeleteUrls = [];

var albumList = [];

var status = "idle";

var counter = 0;

async function handleLoadInitialAlbums(request, sendResponse) {
	
	albums = await $.getJSON(chrome.extension.getURL('albums.json'));

	albumList = albums;
	await chrome.storage.local.set({ "albums": albumList });

	sendResponse();
	
}

async function handleInitAlbums(request, sendResponse) {
	
	const albums = request.albums;

	albumList = albums.map(item => {
		return {url: item, downloaded: false, deleted: false}
	});

	await chrome.storage.local.set({ "albums": albumList });

	sendResponse();
}

async function handleSaveStatus(request, sendResponse) {
	
	await chrome.storage.local.set({ "albums": albumList });

	sendResponse();
}

async function handleStopProcess(request, sendResponse) {
	status = "idle";
	await chrome.storage.local.set({ "albums": albumList });
	
	sendResponse();
}

function handleOutputAlbums(request, sendResponse) {
	
	var blob = new Blob([JSON.stringify(albumList, null, 2)], {type: "application/json"});
	var url = URL.createObjectURL(blob);
	chrome.downloads.download({
	  url: url,
	  filename: 'albums.json'
	});

	sendResponse();
}

async function handleLoadAlbums(request, sendResponse) {

	var albums = await chrome.storage.local.get("albums", function (result) {

		albumList = result.albums;
	
		if (albumList == null || albumList == undefined)
			albumList = [];
		
		sendResponse();
	});
}

function handleAlbum(request, sendResponse) {
	if (photoDeleteUrls.length == 0) {
		// register all urls
		request.links.forEach(url => {
			photoDeleteUrls.push({done: false, url: url});
		});
		sendResponse(photoDeleteUrls[0]);
	}
	else {
		// search and return a url that should be dealed
		for (i=0; i<photoDeleteUrls.length; i++) {
			if (!photoDeleteUrls[i].done) {
				sendResponse({done:false, url:photoDeleteUrls[i].url});
			}
		}
		if (i == photoDeleteUrls.length) {
			sendResponse({done: true});
		}
	}
}

async function nextAlbum(request, sendResponse) {
	counter ++;
	if (counter % 100 == 0) {
		
		await chrome.storage.local.set({ "albums": albumList });
	}
	photoDeleteUrls = [];
	
	var album = albumList.find(item => item.downloaded == false);
	if (album) {
		sendResponse({
			done:false,
			url: album.url
		})
	}
	else {
		sendResponse({done: true});
	}
}

function setDoneAlbum(url) {
	var album = albumList.find(item => url.includes(item.url));
	if (album) {
		album.downloaded = true;
	}
}

function handlePhoto(request, sendResponse) {
	var found = -1;
	for (i=0; i<photoDeleteUrls.length; i++) {
		if (photoDeleteUrls[i].url == request.link) {
			photoDeleteUrls[i].done = true;
			found = i;
			break;
		}
	}

	if (found >= 0 && found+1 < photoDeleteUrls.length) {
		sendResponse({done:false, url:photoDeleteUrls[found+1].url});
	}
	else {
		// this means all photos in the album checked
		if (photoDeleteUrls.length > 0)
			setDoneAlbum(photoDeleteUrls[0].url);
		nextAlbum(request, sendResponse);
	}
}

function handleStartDownload(request, sendResponse) {

	status = "downloading";

	sendResponse();
}

function handleCheckStatus(request, sendResponse) {

	sendResponse({status:status});
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type == "initAlbums") {
			handleInitAlbums(request, sendResponse);
		}
		else if (request.type == "loadAlbums") {
			handleLoadAlbums(request, sendResponse);
		}
		else if (request.type == "startDownload") {
			handleStartDownload(request, sendResponse);
		}
		else if (request.type == "nextAlbum") {
			if (request.link)
				setDoneAlbum(request.link);
			nextAlbum(request, sendResponse);
		}
		else if (request.type == "album") {
			handleAlbum(request, sendResponse);
		}
		else if (request.type == "photo") {
			handlePhoto(request, sendResponse);
		}
		else if (request.type == "checkStatus") {
			handleCheckStatus(request, sendResponse);
		}
		else if (request.type == "saveStatus") {
			handleSaveStatus(request, sendResponse);
		}
		else if (request.type == "stopProcess") {
			handleStopProcess(request, sendResponse);
		}
		else if (request.type == "output") {
			handleOutputAlbums(request, sendResponse);
		}
		else if (request.type == "loadInitial") {
			handleLoadInitialAlbums(request, sendResponse);
		}
		
		/*
		The sendResponse callback is only valid if used synchronously, 
		or if the event handler returns true to indicate that it will respond asynchronously.
		*/
		return true;
	}
);
