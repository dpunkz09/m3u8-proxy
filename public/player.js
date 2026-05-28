(function(){
  const input = document.getElementById('m3u8Input');
  const loadBtn = document.getElementById('loadBtn');
  const stopBtn = document.getElementById('stopBtn');
  const video = document.getElementById('video');
  let hls = null;

  function buildProxyUrl(rawUrl) {
    return `/proxy?url=${encodeURIComponent(rawUrl)}`;
  }

  function loadUrl(rawUrl) {
    if (!rawUrl) return alert('Please enter an M3U8 URL');

    const proxied = buildProxyUrl(rawUrl);

    if (hls) {
      hls.destroy();
      hls = null;
    }

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(proxied);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(()=>{});
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        console.error('HLS error', event, data);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxied;
      video.addEventListener('loadedmetadata', function() {
        video.play().catch(()=>{});
      });
    } else {
      alert('HLS is not supported in this browser');
    }
  }

  loadBtn.addEventListener('click', function() {
    loadUrl(input.value.trim());
  });

  stopBtn.addEventListener('click', function() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.pause();
    video.removeAttribute('src');
    video.load();
  });

  // Allow Enter key
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loadUrl(input.value.trim());
  });

  // Pre-fill with example (optional)
  // input.value = 'https://example.com/stream.m3u8';
})();
