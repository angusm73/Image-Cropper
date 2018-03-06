var cropper;

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    cropper = new Crop({
        element: '.crop-holder',
        preview: '.img-preview'
    })
    console.log(cropper)
}, false)
