
var lastScrollTop = 0;
function scrollToBottom_photos(targetFunction) {

	var scrollPane = $('div[jsname="a9kxte"]').not('[aria-hidden="true"]')[0];

	lastScrollTop = scrollPane.scrollTop;
	scrollPane.scrollBy(0, 10000);
	
	if (scrollPane.scrollTop == lastScrollTop) {
		targetFunction();
	}
	else {
		setTimeout(() => {scrollToBottom_photos(targetFunction)}, 2000);
	}
}

function scrollToBottom_albums(targetFunction) {

	var bottomLine = $('div[jsname="MV2Ukb"]')[0].textContent;
	
	if (bottomLine == "Looks like you've reached the end") {
		targetFunction();
		return;
	}
	
	var scrollPane = $('div[jsname="a9kxte"]').not('[aria-hidden="true"]')[0];

	scrollPane.scrollBy(0, 100000000);
	setTimeout(() => {scrollToBottom_albums(targetFunction)},300);
}

// function handleAlbumArchive() {
// 	var albums = [];

// 	$("div[role='listitem']").each(function() {
// 		// console.log(this);
// 		let dataLink = $(this).attr('data-link');
// 		let dataPdu = $(this).attr('data-bpu');

// 		if (!dataLink.endsWith('albums/autobackup') && !dataLink.endsWith('albums/profile-photos')) {
// 			console.log(dataLink);
// 			console.log(dataPdu);

// 			url = 'https://get.google.com' + dataLink.substring(1);

// 			albums.push(url);
// 		}
// 	});

// 	console.log(albums);
// 	// chrome.downloads.download({body: "OK!!!!!!!!!!!!"});

// 	if (albums.length > 0) {
// 		chrome.runtime.sendMessage(
// 			{"type": "albumArchive", "links": albums},
// 			function(response) {
// 				if (response.done) {
// 					alert('Completed!');
// 				}
// 				else {
// 					window.location.href = response.url;
// 				}
// 			}
// 		);
// 	}
// }

function handleAlbum() {
	var photos = [];
	$("div[role='list']").children('div').each(function() {
		let dataMk = $(this).attr('data-mk');
		url = window.location.href + '/' + dataMk;
		photos.push(url);
	});
	if (photos.length > 0) {
		chrome.runtime.sendMessage(
			{"type": "album", "links": photos},
			function(response) {
				if (response.done) {
					alert('Completed!');
				}
				else {
					window.location.href = response.url;
				}
			}
		);
	}
	else {
		chrome.runtime.sendMessage(
			{"type": "nextAlbum", "link": window.location.href},
			function(response) {
				if (response.done) {
					alert('Completed!');
				}
				else {
					window.location.href = response.url;
				}
			}
		);		
	}
}

function handlePhoto() {
	$("div[data-tooltip='More options']").click();
	
	window.setTimeout(function() {
		var photoUrl = window.location.href;
		let download_span = $("span[aria-label='Download photo']")[0];
		if (!download_span) {
			download_span = $("span[aria-label='Download video']")[0];
		}
		if (download_span) {
			let url = download_span.children[2].getAttribute('data-du');
			window.open(url);
		}

		window.setTimeout(function() {

			chrome.runtime.sendMessage(
				{"type": "photo", "link": photoUrl},
				function(response) {
					if (response.done) {
						alert('Completed!');
					}
					else {
						window.location.href = response.url;
					}
				}
			);
		}, 500);
		
	}, 500);
}

function getSlashCount(str) {
	let str2 = str.replaceAll('/', '');
	return str.length - str2.length;
}

function handleListAlbums() {

	var albums = [];

	$("div[role='listitem']").each(function() {
		let dataLink = $(this).attr('data-link');
		let dataPdu = $(this).attr('data-bpu');

		if (!dataLink.endsWith('albums/autobackup') && !dataLink.endsWith('albums/profile-photos')) {
			console.log(dataLink);
			console.log(dataPdu);

			url = 'https://get.google.com' + dataLink.substring(1);

			albums.push(url);
		}
	});

	chrome.runtime.sendMessage(
		{"type": "initAlbums", "albums": albums},
		() => {
			alert('Album list is saved successfully.');
		}
	);
}

$(document).ready(function() {

	chrome.runtime.sendMessage(
		{"type": "checkStatus"},
		(response) => {
			if (response.status == 'downloading') {

				let url = window.location.href;
				let slashCount = getSlashCount(url);
				if (slashCount == 6 && !url.includes('/albums/')) {  // case of album
					scrollToBottom_photos(handleAlbum);
				}
				if (slashCount == 7) {
					handlePhoto();
				}
			}
		}
	);

	chrome.runtime.onMessage.addListener(msgObj => {
		
		if (msgObj['type'] == 'album_collect') {
			
			let url = window.location.href;
			let slashCount = getSlashCount(url);
			if (slashCount == 4 || (slashCount == 6 && url.includes('/albums/'))) {
				scrollToBottom_albums(handleListAlbums);
			}
			else {
				alert('you are not on the root page');
			}
		}
		else if (msgObj['type'] == 'album_load') {
			chrome.runtime.sendMessage(
				{"type": "loadAlbums"},
				() => {
					alert('Album list is loaded successfully.');
				}
			);
		}
		else if (msgObj['type'] == 'album_download') {
			
			chrome.runtime.sendMessage(
				{"type": "startDownload"},
				() => {
					chrome.runtime.sendMessage(
						{"type": "nextAlbum"},
						function(response) {
							if (response.done) {
								alert('Completed!');
							}
							else {
								window.location.href = response.url;
							}
						}
					);
				}
			);
		}
		else if (msgObj['type'] == 'album_delete') {

		}
		else if (msgObj['type'] == 'album_save_status') {

			chrome.runtime.sendMessage(
				{"type": "saveStatus"},
				() => {
					alert('Album is saved successfully.');
				}
			);
		}
		else if (msgObj['type'] == 'album_stop_process') {

			chrome.runtime.sendMessage(
				{"type": "stopProcess"},
				() => {
					alert('Stopped the process and saved the albums successfully.');
				}
			);
		}
	});

});
