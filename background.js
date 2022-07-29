let endpointUrl;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get({endpointUrl: 'http://127.0.0.1:8000'}, (data) => {
        endpointUrl = data.endpointUrl;
        console.log(endpointUrl);
    });
});

/*
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo && changeInfo.status === 'complete' && !tab.url.includes('Help:IPA')) {
		chrome.tabs.sendMessage(tabId, {action: 'buildButtons'});
    }
});
*/

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.endpointUrl?.newValue) {
        endpointUrl = changes.endpointUrl.newValue;
        console.log('set new endpoint to', endpointUrl);
    }
});

function readFile(blob) {    
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result);
        };
        fr.onerror = reject;
        // This should probably be done server-side but I hate Rocket
        fr.readAsDataURL(blob.slice(0, blob.size, 'audio/ogg'));
    });
}

async function BuildAudio(jsonData, sendResponse) {
    // This used to be prettier, trust me
    return fetch(endpointUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(jsonData)
    })
    .then((response) => response.blob())
    .then((blob) => {
        readFile(blob)
        .then((file) => {
            sendResponse({'result': 'success', 'audio': file});
        });
   })
    .catch((error) => {
        return {'result': 'error', 'error': error};
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'requestPronounce') {
        /*
        var responseStream;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpointUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.responseType = 'blob';

        // send the collected data as JSON
        xhr.send(JSON.stringify(jsonData));

        xhr.onloadend = function () {
            if (xhr.status === 200) {
                var reader = new FileReader();

                reader.addEventListener("load", () => sendResponse(this.result));

                reader.readAsDataURL(xhr.response);
            } else if (xhr.status === 400) {
                alert('Malformed request.');
            } else {
                alert('Error: ' + xhr.status);
            }
        };
        */
        (async() => {
            await BuildAudio(request.jsonData, sendResponse);
        })();
        
        return true;
    }
  }
);