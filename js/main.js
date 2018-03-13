var croppers

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    croppers = [
        new Crop({
            element: '#crop1',
            preview: '#preview1'
        }),
        new Crop({
            element: '#crop2',
            preview: '#preview2'
        })
    ]
    console.log(croppers)
}, false)
