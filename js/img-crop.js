function Crop(options) {

    /* Get DOM node from selector */
    this.element = document.querySelector(typeof options == 'object' ? options.element : options)
    var self = this

    /* Scope all elements */
    let upload_btn, remove_btn, form, input, preview, preview_inner, img_el, crop_overlay

    /* Get preview if set */
    if (options.preview) {
        this.preview = document.querySelector(options.preview)
    }

    /* Debuggging... */
    this.crop_area = {
        left: 20,
        top: 20,
        width: 250,
        height: 80
    }
    /* End debugging... */



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
        _update_offset()
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
        this.element.querySelector('form').appendChild(input)
    }

    var cur_side
    let click_down = e => {
        cur_side = {
            el: e.target,
            index: Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        }
        document.addEventListener('mousemove', click_move, false)
        e.preventDefault()
        return false
    }

    var preview_offset,
        _update_offset = () => {
            preview_offset = preview_inner.getBoundingClientRect()
        }
    function click_move(e) {
        if (cur_side.index == 1) {
            // Top
            let _top = e.pageY - preview_offset.top
            if (_top < preview_inner.clientHeight && _top > 0) {
                let _old_top = self.crop_area.top
                self.crop_area.top = Math.round(_top)
                self.crop_area.height -= self.crop_area.top - _old_top
            }
        } else if (cur_side.index == 3) {
            // Bottom
            let _bottom = (preview_offset.top + preview_inner.clientHeight) - e.pageY
            if (_bottom < preview_inner.clientHeight - self.crop_area.top && _bottom > 0) {
                self.crop_area.height = Math.round(preview_inner.clientHeight - self.crop_area.top - _bottom)
            }
        } else if (cur_side.index == 4) {
            // Left
            let _left = e.pageX - preview_offset.left
            if (_left < preview_inner.clientWidth && _left > 0) {
                let _old_left = self.crop_area.left
                self.crop_area.left = Math.round(_left)
                self.crop_area.width -= self.crop_area.left - _old_left
            }
        } else {
            // Right
            let _right = (preview_offset.left + preview_inner.clientWidth) - e.pageX
            if (_right < preview_inner.clientWidth - self.crop_area.left && _right > 0) {
                self.crop_area.width = Math.round(preview_inner.clientWidth - self.crop_area.left - _right)
            }
        }
        _update_overlay()
    }

    var last_position
    function drag_crop_area(e) {
        if (last_position) {
            /* Get new crop position */
            let deltaX = e.clientX - last_position.x,
                deltaY = e.clientY - last_position.y,
                new_pos = {
                    left: self.crop_area.left + deltaX < 0 ? 0 : self.crop_area.left + deltaX,
                    top: self.crop_area.top + deltaY < 0 ? 0 : self.crop_area.top + deltaY
                }

            /* Restrict to inside crop area */
            if (new_pos.left >= preview_inner.clientWidth - self.crop_area.width) new_pos.left = self.crop_area.left
            if (new_pos.top >= preview_inner.clientHeight - self.crop_area.height) new_pos.top = self.crop_area.top

            /* Update overlay then render */
            self.crop_area = Object.assign(self.crop_area, new_pos)
            _update_overlay()
        }
        last_position = {
            x: e.clientX,
            y: e.clientY
        }
    }

    /* Update overlay dimensions */
    function _update_overlay() {
        crop_overlay.style.left = self.crop_area.left + 'px'
        crop_overlay.style.top = self.crop_area.top + 'px'
        crop_overlay.style.width = self.crop_area.width + 'px'
        crop_overlay.style.height = self.crop_area.height + 'px'
    }

    /* Fetch cropped image preview from server */
    function _update_preview() {
        let options = {
            method: 'POST',
            body: JSON.stringify(self.crop_area),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
        fetch('/preview', options)
            .then(response => {
                return response.text()
            })
            .then(base64_preview => {
                if (!self.preview_img) {
                    self.preview_img = document.createElement('img')
                    self.preview.appendChild(self.preview_img)
                }
                self.preview_img.src = 'data:image/jpeg;base64,' + base64_preview
            })
    }

    /* Limit calls to a function */
    function throttle(callback, limit) {
        let wait = false
        return () => {
            if (!wait) {
                callback.apply(null, arguments)
                wait = true
                setTimeout(() => {
                    wait = false
                }, limit)
            }
        }
    }

    /* Generate markup for img cropper */
    function generate_crop_template() {
        /* Upload button */
        upload_btn = document.createElement('button')
        upload_btn.classList.add('btn')
        upload_btn.classList.add('upload-btn')
        upload_btn.innerHTML = "Upload Image"

        /* Remove button */
        remove_btn = document.createElement('button')
        remove_btn.classList.add('btn')
        remove_btn.classList.add('remove-btn')
        remove_btn.innerHTML = "Remove"

        /* Form */
        input = document.createElement('input')
        input.type = 'file'
        input.classList.add('hidden')
        form = document.createElement('form')
        form.action = "/upload-file"
        form.appendChild(input)

        /* Image preview */
        preview = document.createElement('div')
        preview.classList.add('crop-preview')
        preview_inner = document.createElement('div')
        preview_inner.classList.add('crop-inner')
        let _placeholder = document.createElement('p')
        _placeholder.classList.add('hidden')
        _placeholder.textContent = "Please choose an image to start cropping..."
        preview.appendChild(_placeholder)
        preview.appendChild(remove_btn)
        preview.appendChild(preview_inner)

        /* Image */
        img_el = document.createElement('img')
        img_el.src = "/test.png"
        img_el.alt = "crop preview"
        preview_inner.appendChild(img_el)

        /* Crop area */
        crop_overlay = document.createElement('div')
        crop_overlay.classList.add('crop-overlay')
        for (let i = 4; i > 0; i--) {
            let side = document.createElement('div')
            side.classList.add('side')
            side.addEventListener('mousedown', click_down, false)
            crop_overlay.appendChild(side)
        }
        preview_inner.appendChild(crop_overlay)

        /* Append everything to self.element */
        self.element.appendChild(upload_btn)
        self.element.appendChild(preview)
        self.element.appendChild(form)
    }

    /* Bind events */
    function bind_events() {
        img_el.addEventListener('load', _update_offset)
        img_el.addEventListener('load', _update_overlay)
        img_el.addEventListener('load', _update_preview)
        upload_btn.addEventListener('click', choose_image, false)
        remove_btn.addEventListener('click', remove_preview, false)
        input.addEventListener('change', show_preview, false)
        crop_overlay.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('side')) return
            document.addEventListener('mousemove', drag_crop_area, false)
        }, false)
        document.addEventListener('mouseup', () => {
            last_position = null
            document.removeEventListener('mousemove', click_move, false)
            document.removeEventListener('mousemove', drag_crop_area, false)
            _update_preview()
        }, false)
        window.addEventListener('resize', throttle(() => {
            _update_offset()
            _update_overlay()
            last_position = null
        }, 50), false)
    }



    /* Initialise Crop */
    (() => {
        generate_crop_template()
        bind_events()
    })()

    /* Public functions */
    this.choose_image = choose_image

    return this

}
