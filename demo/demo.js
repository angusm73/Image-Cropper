var croppers

/* Init image cropper on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    croppers = [
        new Crop({
            element: '#crop1',
            preview: '#preview1',
            img: 'test-image-1.png',
            ratio: 1,
            area: {
                left: '10%',
                top: '10%',
                width: '30%'
            }
        })
    ]

    let demo_btn = document.getElementById('open-crop-modal')
    demo_btn.addEventListener('click', () => {
        let modal_cropper
        open_modal(
            '<div id="crop-modal"></div><div id="crop-modal-preview"></div>',
            () => {
                modal_cropper = new Crop({
                    element: '#crop-modal',
                    preview: '#crop-modal-preview'
                })
            },
            () => {
                modal_cropper.destroy()
                modal_cropper = null
            }
        )
    })
}, false)



/* Modal js */
var modal, overlay, modal_close_cb
function open_modal(content, callback, close_callback) {
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
    if (typeof close_callback === 'function') {
        modal_close_cb = close_callback
    }
}

function close_modal() {
    modal.classList.remove('open')
    overlay.classList.remove('open')
    if (typeof modal_close_cb === 'function') {
        modal_close_cb()
    }
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