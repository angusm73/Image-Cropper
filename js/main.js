var cropper;

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    cropper = new Crop('.img-wrapper')
    console.log(cropper)
}, false)
