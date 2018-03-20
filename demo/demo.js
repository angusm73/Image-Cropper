var croppers

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    croppers = [
        new Crop({
            element: '#crop1',
            preview: '#preview1',
            img: 'test-image-1.png',
            area: {
                left: '10%',
                top: '10%',
                width: '80%',
                height: '30%'
            }
        }),
        new Crop({
            element: '#crop2',
            preview: '#preview2',
            img: 'test-image-2.png',
            ratio: 1
        })
    ]
    console.log(croppers)
}, false)
