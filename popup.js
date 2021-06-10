function handleCollect(type) {
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

        chrome.tabs.sendMessage(tabs[0].id, {type: type});
        window.close();
    });        
}

let btnCollect = document.getElementById('collect');
let btnLoad = document.getElementById('load');
let btnDownload = document.getElementById('download');
let btnDelete = document.getElementById('delete');
let btnSave = document.getElementById('saveStatus');
let btnStop = document.getElementById('stop');
let btnOutput = document.getElementById('output');
let btnCheck = document.getElementById('check');
let btnLaodInitial = document.getElementById('loadInitial');

btnCollect.addEventListener('click', () => {handleCollect('album_collect')});
btnDownload.addEventListener('click', () => handleCollect('album_download'));
btnDelete.addEventListener('click', () => handleCollect('album_delete'));

// btnLoad.addEventListener('click', () => handleCollect('album_load'));
btnLoad.addEventListener('click', () => {
    
    chrome.runtime.sendMessage(
        {"type": "loadAlbums"},
        () => {
            alert('Album list is loaded successfully.');
        }
    );
});
// btnSave.addEventListener('click', () => handleCollect('album_save_status'));
btnSave.addEventListener('click', () => {

    chrome.runtime.sendMessage(
        {"type": "saveStatus"},
        () => {
            alert('Album is saved successfully.');
        }
    );
});

// btnStop.addEventListener('click', () => handleCollect('album_stop_process'));
btnStop.addEventListener('click', () => {

    chrome.runtime.sendMessage(
        {"type": "stopProcess"},
        () => {
            alert('Stopped the process and saved the albums successfully.');
        }
    );
});

btnOutput.addEventListener('click', () => {

    chrome.runtime.sendMessage(
        {"type": "output"},
        () => {
        }
    );
});


btnCheck.addEventListener('click', () => {
    chrome.tabs.executeScript(null, { file: "jquery-2.1.3.min.js", allFrames: false, runAt: 'document_start' },  function() {
        chrome.tabs.executeScript(null, {
            code: `
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
                albums;
            `,
            allFrames: false, // this is the default
            runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
        }, function(results) {
            var albums = results[0];
            
            chrome.runtime.sendMessage(
                {"type": "initAlbums", "albums": albums},
                () => {
                    alert('Album list is saved successfully.');
                }
            );
        });
    });
});

btnLaodInitial.addEventListener('click', () => {
    
    chrome.runtime.sendMessage(
        {"type": "loadInitial"},
        () => {
            alert('Initial Album list is loaded successfully.');
        }
    );
});