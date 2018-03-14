'use strict';

var croppers;

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', function () {
    croppers = [new Crop({
        element: '#crop1',
        preview: '#preview1',
        area: {
            left: '80%',
            top: '20px',
            width: '20%',
            height: '40px'
        }
    }), new Crop({
        element: '#crop2',
        preview: '#preview2'
    })];
    console.log(croppers);
}, false);
//# sourceMappingURL=main.js.map
