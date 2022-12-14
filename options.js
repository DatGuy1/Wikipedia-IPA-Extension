// Saves options to chrome.storage
function save_options() {
  var endpointUrl = document.getElementById('endpointUrl').value;
  chrome.storage.sync.set({
    endpointUrl: endpointUrl
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({endpointUrl: 'https://ipa.datguy.at'}, (data) => {
    document.getElementById('endpointUrl').value = data.endpointUrl;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.onkeydown = function(e) {
  if (e.keyCode == 13) {
    save_options();
  }
};