function updateButtonState(event, extElement) {
	var audio = event.currentTarget

	if (audio.paused || audio.ended) {
		extElement.setAttribute('state', 'play');
	} else {
		extElement.setAttribute('state', 'pause');
	}
}

function requestPronounciation(extElement, callback) {
	var jsonData = {'ipa': extElement.getAttribute('ipa'), 'language': extElement.getAttribute('language')};

    chrome.runtime.sendMessage({action: 'requestPronounce', jsonData: jsonData}, (response) => {
        if (response.result == 'error') {
            alert('Error ' + response.error.status);
            return;
        }
        callback(response.audio);
    });
    return;
}

function getAudioElement(extElement, callback) {
	var audioElement;

	if (extElement.previousElementSibling.tagName.toLowerCase() === 'audio') {
		audioElement = extElement.previousElementSibling;
	} else {
		audioElement = document.createElement('audio');

		audioElement.addEventListener('play', function(event) { updateButtonState(event, extElement) });
		audioElement.addEventListener('pause', function(event) { updateButtonState(event, extElement) });
		audioElement.addEventListener('ended', function(event) { updateButtonState(event, extElement) });

		requestPronounciation(extElement, function(returnSrc) {
			audioElement.src = returnSrc;
			
			extElement.parentNode.insertBefore(audioElement, extElement);
		});
	}
	
	callback(audioElement);
}

function playPause(event) {
	getAudioElement(event.target, function(audioElement) {
		if (audioElement.paused || audioElement.ended) {
			audioElement.play();
		} else {
			audioElement.pause();
		}
	});
}

function downloadAudio(event) {
	event.preventDefault();
	
	getAudioElement(event.target, function(audioElement) {
		var downloadLink = document.createElement('a');
		downloadLink.href = audioElement.src;
		downloadLink.download = event.target.getAttribute('ipa');

		downloadLink.click();

		downloadLink.remove();
	});
}

function BuildButtons() {
    document.querySelectorAll('span.IPA').forEach((element) => {
        extElement = document.createElement('a');
        extElement.classList.add('ext-audiobutton');
        extElement.setAttribute('state', 'play');
        extElement.setAttribute('title', 'Play/Pause');
        extElement.setAttribute('ipa', element.innerText.replace(/^[/[]+|[/\]]+$/g, ''));
        extElement.setAttribute('language', element.firstElementChild.href.replace(/.*\//g, '').replace(/_/g, ' '));
        extElement.addEventListener('click', playPause);
        extElement.addEventListener('contextmenu', downloadAudio);
        element.parentNode.insertBefore(extElement, element.nextSibling);
    });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === 'buildButtons') {
        BuildButtons();
    } else if (request.action === 'updateEndpoint') {
        endpointUrl = request.endpoint;
    }
});

BuildButtons();