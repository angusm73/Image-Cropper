function Crop(el) {

    /* Get DOM node from selector */
    let wrapper = document.querySelector(el)
    let upload_btn = wrapper.querySelector('.upload-btn')
    let remove_btn = wrapper.querySelector('.remove-btn')
    let preview = wrapper.querySelector('.crop-preview')
    let preview_inner = preview.querySelector('.crop-inner')
    let input = wrapper.querySelector('input[type=file].hidden')
    let img_el = preview_inner.querySelector('img')
    let crop_overlay = document.createElement('div')

    /* Open file browser */
    let choose_image = () => {
        input.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }))
    }

    /* SHOW image preview */
    let show_preview = () => {
        if (input.files && input.files[0]) {
            let reader = new FileReader()
            reader.onload = (e) => {
                img_el.style.display = 'block'
                img_el.src = e.target.result
                preview.classList.remove('no-img')
                preview.children[0].classList.add('hidden')
            }
            reader.readAsDataURL(input.files[0])
        }
    }

    /* REMOVE image preview */
    let remove_preview = () => {
        img_el.style.display = 'none'
        preview.classList.add('no-img')
        preview.children[0].classList.remove('hidden')
        input.remove()
        input = document.createElement('input')
        input.type = 'file'
        input.classList.add('hidden')
        input.addEventListener('change', show_preview, false)
        wrapper.querySelector('form').appendChild(input)
    }

    var cur_side
    let click_down = e => {
        cur_side = {
            el: e.target,
            index: Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        }
        preview_inner.addEventListener('mousemove', click_move, false)
        document.addEventListener('mouseup', click_up, false)
        e.preventDefault()
        return false
    }

    var overlay_offset = preview_inner.getBoundingClientRect()
    let click_move = e => {
        if (cur_side.index & 1) {
            // Odd number - top / bottom - bitwise comparison
            crop_overlay.style.top = (e.pageY - overlay_offset.top) + 'px'
        } else {
            // Even number - left / right
            crop_overlay.style.left = (e.pageX - overlay_offset.left) + 'px'
        }
    }

    let click_up = e => {
        // console.log(e.offsetX, e.offsetY, 'mouse up', cur_side)
        preview_inner.removeEventListener('mousemove', click_move, false)
    }

    /* Bind events */
    let bind_events = () => {
        upload_btn.addEventListener('click', choose_image, false)
        remove_btn.addEventListener('click', remove_preview, false)
        input.addEventListener('change', show_preview, false)
        // preview_inner.addEventListener('mousedown', click_down, false)
    }



    /* Initialise preview */
    (() => {
        for (let i = 4; i > 0; i--) {
            let side = document.createElement('div')
            side.classList.add('side')
            side.addEventListener('mousedown', click_down, false)
            crop_overlay.appendChild(side)
        }
        crop_overlay.classList.add('crop-overlay')
        preview_inner.appendChild(crop_overlay)
        if (!img_el) {
            img_el = document.createElement('img')
            preview_inner.appendChild(img_el)
        }
        bind_events()
    })()

    this.element = wrapper
    this.choose_image = choose_image

    return this

}
