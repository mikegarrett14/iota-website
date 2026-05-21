(function () {
  var cfg = window.CONFIG && CONFIG.driveResults;
  if (!cfg || !cfg.apiKey || !cfg.folderId) return;

  var carousel = document.querySelector('.results-carousel');
  if (!carousel) return;

  var query = encodeURIComponent("'" + cfg.folderId + "' in parents and mimeType contains 'image/' and trashed = false");
  var url = 'https://www.googleapis.com/drive/v3/files?q=' + query +
            '&key=' + cfg.apiKey +
            '&fields=' + encodeURIComponent('files(id,name)') +
            '&pageSize=100&orderBy=createdTime';

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.files || !data.files.length) return;
      data.files.forEach(function (file) {
        var card = document.createElement('div');
        card.className = 'result-card result-card--screenshot';
        var img = document.createElement('img');
        img.src = 'https://drive.google.com/thumbnail?id=' + file.id + '&sz=w600';
        img.alt = file.name.replace(/\.[^.]+$/, '');
        img.loading = 'lazy';
        card.appendChild(img);
        carousel.appendChild(card);
      });
    })
    .catch(function () {});
})();
