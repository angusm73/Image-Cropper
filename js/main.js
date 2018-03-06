'use strict';

var cropper;

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', function () {
    cropper = new Crop({
        element: '.crop-holder',
        preview: '.img-preview'
    });
    console.log(cropper);
}, false);
//# sourceMappingURL=main.js.map
