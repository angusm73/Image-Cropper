var croppers

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    croppers = [
        new Crop({
            element: '#crop1',
            preview: '#preview1',
            area: {
                left: '15%',
                top: '15%',
                width: '70%',
                height: '70%'
            }
        }),
        new Crop({
            element: '#crop2',
            preview: '#preview2'
        })
    ]
    console.log(croppers)
}, false)
