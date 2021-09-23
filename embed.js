(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/brainpad-classic/",
    "verprefix": "",
    "workerjs": "/brainpad-classic/worker.js",
    "monacoworkerjs": "/brainpad-classic/monacoworker.js",
    "pxtVersion": "4.3.1",
    "pxtRelId": "",
    "pxtCdnUrl": "/brainpad-classic/",
    "commitCdnUrl": "/brainpad-classic/",
    "blobCdnUrl": "/brainpad-classic/",
    "cdnUrl": "/brainpad-classic/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "brainpad",
    "simUrl": "/brainpad-classic/simulator.html",
    "partsUrl": "/brainpad-classic/siminstructions.html",
    "runUrl": "/brainpad-classic/run.html",
    "docsUrl": "/brainpad-classic/docs.html",
    "isStatic": true
};

    var scripts = [
        "/brainpad-classic/highlight.js/highlight.pack.js",
        "/brainpad-classic/bluebird.min.js",
        "/brainpad-classic/semantic.js",
        "/brainpad-classic/marked/marked.min.js",
        "/brainpad-classic/target.js",
        "/brainpad-classic/pxtembed.js"
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/brainpad-classic/jquery.js")

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.initCallbacks = pxtCallbacks
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())
