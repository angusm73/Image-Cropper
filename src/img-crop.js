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

    var moving_sides = []
    function _side_click_start(e) {
        let index = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        moving_sides = [index]
        document.addEventListener('mousemove', _anchor_drag, false)
        e.preventDefault()
        return false
    }

    function _corner_click_start(e) {
        let index = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) - 3
        moving_sides = [index, index - 1 ? index - 1 : 4]
        document.addEventListener('mousemove', _anchor_drag, false)
        e.preventDefault()
        return false
    }

    function _anchor_drag(e) {
        let old_area = JSON.parse(JSON.stringify(self.crop_area))
        // Left
        if (moving_sides.includes(4)) {
            let _left = Math.max(e.pageX - self.preview_offset.left, 0)
            self.crop_area.left = Math.round(_left)
            if (self.crop_area.left - (self.crop_area.width - old_area.width) > 0) {
                self.crop_area.width -= self.crop_area.left - old_area.left
                if (options.ratio) {
                    self.crop_area.height = self.crop_area.width / options.ratio
                    if (moving_sides.includes(1) && self.crop_area.top - (self.crop_area.height - old_area.height) > 0) {
                        self.crop_area.top -= self.crop_area.height - old_area.height
                    }
                    _update_overlay()
                    return
                }
            }
        }
        // Top
        if (moving_sides.includes(1)) {
            let _top = Math.max(e.pageY - self.preview_offset.top, 0)
            self.crop_area.top = Math.round(_top)
            if (self.crop_area.top - (self.crop_area.height - old_area.height) > 0) {
                self.crop_area.height -= self.crop_area.top - old_area.top
                if (options.ratio) {
                    self.crop_area.width = self.crop_area.height * options.ratio
                    if (moving_sides.includes(4) && self.crop_area.left - (self.crop_area.width - old_area.width) > 0) {
                        self.crop_area.left -= self.crop_area.width - old_area.width
                    }
                    _update_overlay()
                    return
                }
            }
        }
        // Right
        if (moving_sides.includes(2)) {
            let _right = Math.max((self.preview_offset.left + preview_inner.clientWidth) - e.pageX, 0)
            self.crop_area.width = Math.round(preview_inner.clientWidth - self.crop_area.left - _right)
            if (options.ratio) {
                self.crop_area.height = self.crop_area.width / options.ratio
            }
        }
        // Bottom
        if (moving_sides.includes(3)) {
            let _bottom = Math.max((self.preview_offset.top + preview_inner.clientHeight) - e.pageY, 0)
            self.crop_area.height = Math.round(preview_inner.clientHeight - self.crop_area.top - _bottom)
            if (options.ratio) {
                self.crop_area.width = self.crop_area.height * options.ratio
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
                left: _convert_to_px(options.area ? options.area.left : '10%', img_el.clientWidth),
                top: _convert_to_px(options.area ? options.area.top : '10%', img_el.clientHeight),
                width: _convert_to_px(options.area ? options.area.width : '40%', img_el.clientWidth),
                height: _convert_to_px(options.area ? options.area.height : '40%', img_el.clientHeight)
            }
            if (options.ratio) {
                self.crop_area.height = self.crop_area.width / options.ratio
            }
        }
        self.preview_offset = preview_inner.getBoundingClientRect()
    }

    /* Update overlay dimensions */
    function _update_overlay() {
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
            document.removeEventListener('mousemove', _anchor_drag, false)
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
        self.element.classList.add('img-cropper')
        if (self.preview) {
            self.preview.classList.add('preview-wrapper');
        }
        self.img_url = self.img_url ? self.img_url : 'test-image-1.png'

        generate_crop_template()
        bind_events()
    })()

    return self
}
