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
        })
    ]

    let demo_btn = document.getElementById('open-crop-modal')
    demo_btn.addEventListener('click', () => {
        open_modal('<div id="crop-modal"></div><div id="crop-modal-preview"></div>', () => {
            croppers.push(new Crop({
                element: '#crop-modal',
                preview: '#crop-modal-preview'
            }))
        })
    })
}, false)



/* Modal js */
var modal, overlay
function open_modal(content, callback) {
    if (!modal) {
        create_modal()
    }
    modal.innerHTML = content
    modal.classList.add('open')
    overlay.classList.add('open')
    center_modal()
    if (typeof callback === 'function') {
        callback()
    }
}

function close_modal() {
    modal.classList.remove('open')
    overlay.classList.remove('open')
}

function create_modal() {
    modal = document.createElement('div')
    overlay = document.createElement('div')
    modal.classList.add('modal')
    overlay.classList.add('overlay')
    overlay.addEventListener('click', close_modal)
    document.body.appendChild(overlay)
    document.body.appendChild(modal)
}

function center_modal() {
    modal.style.top = document.querySelector('html').scrollTop + 100 + 'px'
}