function Crop(options) {
    var self = this

    /* Scope all elements */
    let upload_btn, remove_btn, form, input, preview, preview_inner, img_el, crop_overlay



    /* ---------------- */
    /*  Crop Functions  */
    /* ---------------- */

    /* Open file browser */
    self.choose_image = () => {
        input.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }))
    }

    /* Show image preview */
    function show_preview() {
        if (input.files && input.files[0]) {
            let reader = new FileReader()
            reader.onload = (e) => {
                img_el.style.display = 'block'
                img_el.src = e.target.result
                preview.classList.remove('no-img')
                preview.children[0].classList.add('hidden')
                _upload_image(input.files[0].name, img_el.src)
            }
            reader.readAsDataURL(input.files[0])
        }
        _update_offset()
    }

    /* Upload image */
    function _upload_image(img_name, img_data) {
        let options = {
            method: 'POST',
            body: JSON.stringify({
                data: img_data,
                file_name: img_name
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
        fetch('/upload', options)
            .then(response => response.text())
            .then(uploaded_filename => {
                if (uploaded_filename !== 'error') {
                    self.img_url = uploaded_filename
                    img_el.src = '/uploads/' + self.img_url
                }
            })
    }

    /* Remove image preview */
    function remove_preview() {
        img_el.style.display = 'none'
        preview.classList.add('no-img')
        preview.children[0].classList.remove('hidden')
        /* Replace input element */
        input.remove()
        input = document.createElement('input')
        input.type = 'file'
        input.classList.add('hidden')
        input.addEventListener('change', show_preview, false)
        self.element.querySelector('form').appendChild(input)
        self.img_url = ''
        self.preview_img.src = ''
        self._update_preview()
    }

    var cur_side
    function _side_click_start(e) {
        cur_side = {
            el: e.target,
            index: Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        }
        document.addEventListener('mousemove', _side_move, false)
        e.preventDefault()
        return false
    }

    var cur_corner
    function _corner_click_start(e) {
        cur_corner = {
            el: e.target,
            index: Array.prototype.indexOf.call(e.target.parentElement.children, e.target) - 3
        }
        document.addEventListener('mousemove', _corner_move, false)
        e.preventDefault()
        return false
    }

    function _side_move(e) {
        if (cur_side.index == 1) {
            // Top
            let _top = e.pageY - self.preview_offset.top
            if (_top < preview_inner.clientHeight && _top > 0) {
                let _old_top = self.crop_area.top
                self.crop_area.top = Math.floor(_top)
                self.crop_area.height -= self.crop_area.top - _old_top
            }
        } else if (cur_side.index == 3) {
            // Bottom
            let _bottom = (self.preview_offset.top + preview_inner.clientHeight) - e.pageY
            if (_bottom < preview_inner.clientHeight - self.crop_area.top && _bottom > 0) {
                self.crop_area.height = Math.floor(preview_inner.clientHeight - self.crop_area.top - _bottom)
            }
        } else if (cur_side.index == 4) {
            // Left
            let _left = e.pageX - self.preview_offset.left
            if (_left < preview_inner.clientWidth && _left > 0) {
                let _old_left = self.crop_area.left
                self.crop_area.left = Math.floor(_left)
                self.crop_area.width -= self.crop_area.left - _old_left
            }
        } else {
            // Right
            let _right = (self.preview_offset.left + preview_inner.clientWidth) - e.pageX
            if (_right < preview_inner.clientWidth - self.crop_area.left && _right > 0) {
                self.crop_area.width = Math.floor(preview_inner.clientWidth - self.crop_area.left - _right)
            }
        }
        _update_overlay()
    }

    function _corner_move(e) {
        // Top
        if (cur_corner.index == 1 || cur_corner.index == 2) {
            let _top = e.pageY - self.preview_offset.top
            if (_top < preview_inner.clientHeight && _top > 0) {
                let _old_top = self.crop_area.top
                self.crop_area.top = Math.floor(_top)
                self.crop_area.height -= self.crop_area.top - _old_top
            }
        }
        // Bottom
        if (cur_corner.index == 3 || cur_corner.index == 4) {
            let _bottom = (self.preview_offset.top + preview_inner.clientHeight) - e.pageY
            if (_bottom < preview_inner.clientHeight - self.crop_area.top && _bottom > 0) {
                self.crop_area.height = Math.floor(preview_inner.clientHeight - self.crop_area.top - _bottom)
            }
        }
        // Left
        if (cur_corner.index == 1 || cur_corner.index == 4) {
            let _left = e.pageX - self.preview_offset.left
            if (_left < preview_inner.clientWidth && _left > 0) {
                let _old_left = self.crop_area.left
                self.crop_area.left = Math.floor(_left)
                self.crop_area.width -= self.crop_area.left - _old_left
            }
        }
        // Right
        if (cur_corner.index == 2 || cur_corner.index == 3) {
            let _right = (self.preview_offset.left + preview_inner.clientWidth) - e.pageX
            if (_right < preview_inner.clientWidth - self.crop_area.left && _right > 0) {
                self.crop_area.width = Math.floor(preview_inner.clientWidth - self.crop_area.left - _right)
            }
        }
        _update_overlay()
    }

    function _area_drag(e) {
        if (self.last_position) {
            /* Get new crop position */
            let deltaX = e.clientX - self.last_position.x,
                deltaY = e.clientY - self.last_position.y,
                new_pos = {
                    left: self.crop_area.left + deltaX < 0 ? 0 : self.crop_area.left + deltaX,
                    top: self.crop_area.top + deltaY < 0 ? 0 : self.crop_area.top + deltaY
                }

            /* Restrict to inside crop area */
            if (new_pos.left > preview_inner.clientWidth - self.crop_area.width) new_pos.left = self.crop_area.left
            if (new_pos.top > preview_inner.clientHeight - self.crop_area.height) new_pos.top = self.crop_area.top

            /* Update overlay then render */
            self.crop_area = Object.assign(self.crop_area, new_pos)
            _update_overlay()
        }
        self.last_position = {
            x: e.clientX,
            y: e.clientY
        }
    }

    function _update_offset() {
        /* Set initial crop area */
        if (typeof self.crop_area == 'undefined') {
            self.crop_area = {
                left: _convert_to_px(options.area ? options.area.left : '10px', img_el.clientWidth),
                top: _convert_to_px(options.area ? options.area.top : '10px', img_el.clientHeight),
                width: _convert_to_px(options.area ? options.area.width : '50px', img_el.clientWidth),
                height: _convert_to_px(options.area ? options.area.height : '50px', img_el.clientHeight)
            }
        }
        self.preview_offset = preview_inner.getBoundingClientRect()
    }

    /* Update overlay dimensions */
    function _update_overlay() {
        /* Constrain to image preview */
        self.crop_area.left = Math.max(self.crop_area.left, 0)
        self.crop_area.top = Math.max(self.crop_area.top, 0)
        self.crop_area.width = self.crop_area.left + self.crop_area.width <= preview_inner.clientWidth
            ? self.crop_area.width
            : preview_inner.clientWidth - self.crop_area.left
        self.crop_area.height = self.crop_area.top + self.crop_area.height <= preview_inner.clientHeight
            ? self.crop_area.height
            : preview_inner.clientHeight - self.crop_area.top

        /* Apply styles to crop overlay */
        crop_overlay.style.left = self.crop_area.left + 'px'
        crop_overlay.style.top = self.crop_area.top + 'px'
        crop_overlay.style.width = self.crop_area.width + 'px'
        crop_overlay.style.height = self.crop_area.height + 'px'
    }

    /* Fetch cropped image preview from server */
    function _update_preview() {
        /* Scale crop dimensions to real image size */
        let scale = img_el ? (img_el.naturalWidth / img_el.clientWidth) : 1,
            img_options = {
                img: self.img_url
            }

        for (let dim in self.crop_area) {
            img_options[dim] = Math.round(self.crop_area[dim] * scale)
        }

        let options = {
            method: 'POST',
            body: JSON.stringify(img_options),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
        fetch('/preview', options)
            .then(response => response.text())
            .then(base64_preview => {
                if (!self.preview_img) {
                    self.preview_img = document.createElement('img')
                    self.preview.appendChild(self.preview_img)
                }
                self.preview_img.src = 'data:image/jpeg;base64,' + base64_preview
            })
    }

    /* Convert value to px inside container */
    function _convert_to_px(value, total) {
        /* Validate value, convert value to string */
        if (typeof value == 'undefined')
            return 0
        value += ''

        /* Split value into unit and number */
        let number = parseFloat(value.replace(/[^-\d]+/, '')),
            unit = value.replace(/[-\d]+/, '')

        if (unit == '%')
            return total * number / 100
        else if (unit == 'px')
            return number < total ? number : total
        else
            return number
    }

    /* Limit calls to a function */
    function _throttle(callback, limit) {
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
        let _upload_img = document.createElement('img')
        _upload_img.alt = "Upload Image"
        _upload_img.src = "/imgs/upload.svg"
        upload_btn.appendChild(_upload_img)

        /* Remove button */
        remove_btn = document.createElement('button')
        remove_btn.classList.add('btn')
        remove_btn.classList.add('remove-btn')
        let _remove_img = document.createElement('img')
        _remove_img.alt = "Remove"
        _remove_img.src = "/imgs/remove.svg"
        remove_btn.appendChild(_remove_img)

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
        preview.appendChild(preview_inner)

        /* Image */
        img_el = document.createElement('img')
        img_el.src = "/uploads/" + self.img_url
        img_el.alt = "crop preview"
        preview_inner.appendChild(img_el)

        /* Crop area */
        crop_overlay = document.createElement('div')
        crop_overlay.classList.add('crop-overlay')
        for (let i = 8; i > 0; i--) {
            let el = document.createElement('div')
            el.classList.add(i > 4 ? 'side' : 'corner')
            el.addEventListener('mousedown', i > 4 ? _side_click_start : _corner_click_start, false)
            crop_overlay.appendChild(el)
        }
        preview_inner.appendChild(crop_overlay)

        /* Append everything to self.element */
        self.element.appendChild(upload_btn)
        self.element.appendChild(remove_btn)
        self.element.appendChild(preview)
        self.element.appendChild(form)
    }

    /* Bind events */
    function bind_events() {
        img_el.addEventListener('load', _update_offset)
        img_el.addEventListener('load', _update_overlay)
        img_el.addEventListener('load', _update_preview)
        upload_btn.addEventListener('click', self.choose_image, false)
        remove_btn.addEventListener('click', remove_preview, false)
        input.addEventListener('change', show_preview, false)
        crop_overlay.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('crop-overlay')) return
            document.addEventListener('mousemove', _area_drag, false)
        }, false)
        document.addEventListener('mouseup', () => {
            self.last_position = null
            document.removeEventListener('mousemove', _side_move, false)
            document.removeEventListener('mousemove', _corner_move, false)
            document.removeEventListener('mousemove', _area_drag, false)
            _update_preview()
        }, false)
        window.addEventListener('resize', _throttle(() => {
            _update_offset()
            _update_overlay()
            self.last_position = null
        }, 50), false)
    }



    /* Initialise Crop */
    (() => {
        if (options.element) {
            /* Get DOM node from selector */
            self.element = document.querySelector(options.element)

            /* Get preview if set */
            if (options.preview) {
                self.preview = document.querySelector(options.preview)
            }

            self.img_url = options.img
        } else {
            self.element = document.querySelector(options)
        }
        self.img_url = self.img_url ? self.img_url : 'test.png'

        generate_crop_template()
        bind_events()
    })()

    return self
}
