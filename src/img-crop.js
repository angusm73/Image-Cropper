class Crop {

    constructor(options) {
        this.options = options

        if (options.element) {
            /* Get DOM node from selector */
            this.element = document.querySelector(options.element)

            /* Get preview if set */
            if (options.preview) {
                this.preview_ = document.querySelector(options.preview)
            }

            this.img_url = options.img
        } else {
            this.element = document.querySelector(options)
        }
        this.element.classList.add('img-cropper')
        if (this.preview_) {
            this.preview_.classList.add('preview-wrapper');
        }
        this.img_url = this.img_url ? this.img_url : 'test-image-2.png'

        this.generate_crop_template()
        this.bind_events()

        return this
    }

    /* ---------------- */
    /*  Crop Functions  */
    /* ---------------- */

    /* Open file browser */
    choose_image() {
        this.input.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }))
    }

    /* Show image preview */
    show_preview() {
        if (this.input.files && this.input.files[0]) {
            let reader = new FileReader()
            reader.onload = (e) => {
                this.img_el.style.display = 'block'
                this.img_el.src = e.target.result
                this.preview.classList.remove('no-img')
                this.preview.children[0].classList.add('hidden')
                this._upload_image(this.input.files[0].name, this.img_el.src)
            }
            reader.readAsDataURL(this.input.files[0])
        }
        this._update_offset()
    }

    /* Upload image */
    _upload_image(img_name, img_data) {
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
                    this.img_url = uploaded_filename
                    this.img_el.src = '/uploads/' + this.img_url
                }
            })
    }

    /* Remove image preview */
    remove_preview() {
        this.img_el.style.display = 'none'
        this.preview.classList.add('no-img')
        this.preview.children[0].classList.remove('hidden')
        /* Replace input element */
        this.input.remove()
        this.input = document.createElement('input')
        this.input.type = 'file'
        this.input.classList.add('hidden')
        this.input.addEventListener('change', this.show_preview, false)
        this.element.querySelector('form').appendChild(this.input)
        this.img_url = ''
        this.preview_img.src = ''
        this._update_preview()
    }

    // var moving_sides = []
    _side_click_start(e) {
        let index = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        this.moving_sides = [index]
        this._update_offset()
        this._anchor_drag_i = this._anchor_drag.bind(this)
        document.addEventListener('mousemove', this._anchor_drag_i, false)
        e.preventDefault()
        return false
    }

    _corner_click_start(e) {
        let index = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) - 3
        this.moving_sides = [index, index - 1 ? index - 1 : 4]
        this._update_offset()
        this._anchor_drag_i = this._anchor_drag.bind(this)
        document.addEventListener('mousemove', this._anchor_drag_i, false)
        e.preventDefault()
        return false
    }

    _anchor_drag(e) {
        let old_area = JSON.parse(JSON.stringify(this.crop_area))
        // Left
        if (this.moving_sides.includes(4)) {
            let _left = Math.max(e.clientX - this.preview_offset.left, 0)
            this.crop_area.left = Math.round(_left)
            if (this.crop_area.left - (this.crop_area.width - old_area.width) > 0) {
                this.crop_area.width -= this.crop_area.left - old_area.left
                if (this.options.ratio) {
                    this.crop_area.height = this.crop_area.width / this.options.ratio
                    if (this.moving_sides.includes(1) && this.crop_area.top - (this.crop_area.height - old_area.height) > 0) {
                        this.crop_area.top -= this.crop_area.height - old_area.height
                    }
                    this._update_overlay()
                    return
                }
            }
        }
        // Top
        if (this.moving_sides.includes(1)) {
            let _top = Math.max(e.clientY - this.preview_offset.top, 0)
            this.crop_area.top = Math.round(_top)
            if (this.crop_area.top - (this.crop_area.height - old_area.height) > 0) {
                this.crop_area.height -= this.crop_area.top - old_area.top
                if (this.options.ratio) {
                    this.crop_area.width = this.crop_area.height * this.options.ratio
                    if (this.moving_sides.includes(4) && this.crop_area.left - (this.crop_area.width - old_area.width) > 0) {
                        this.crop_area.left -= this.crop_area.width - old_area.width
                    }
                    this._update_overlay()
                    return
                }
            }
        }
        // Right
        if (this.moving_sides.includes(2)) {
            let _right = Math.max((this.preview_offset.left + this.preview_inner.clientWidth) - e.clientX, 0)
            this.crop_area.width = Math.round(this.preview_inner.clientWidth - this.crop_area.left - _right)
            if (this.options.ratio) {
                this.crop_area.height = this.crop_area.width / this.options.ratio
            }
        }
        // Bottom
        if (this.moving_sides.includes(3)) {
            let _bottom = Math.max((this.preview_offset.top + this.preview_inner.clientHeight) - e.clientY, 0)
            this.crop_area.height = Math.round(this.preview_inner.clientHeight - this.crop_area.top - _bottom)
            if (this.options.ratio) {
                this.crop_area.width = this.crop_area.height * this.options.ratio
            }
        }
        this._update_overlay()
    }

    _area_drag(e) {
        if (this.last_position) {
            /* Get new crop position */
            let deltaX = e.clientX - this.last_position.x,
                deltaY = e.clientY - this.last_position.y,
                new_pos = {
                    left: this.crop_area.left + deltaX < 0 ? 0 : this.crop_area.left + deltaX,
                    top: this.crop_area.top + deltaY < 0 ? 0 : this.crop_area.top + deltaY
                }

            /* Restrict to inside crop area */
            if (new_pos.left > this.preview_inner.clientWidth - this.crop_area.width) new_pos.left = this.crop_area.left
            if (new_pos.top > this.preview_inner.clientHeight - this.crop_area.height) new_pos.top = this.crop_area.top

            /* Update overlay then render */
            this.crop_area = Object.assign(this.crop_area, new_pos)
            this._update_overlay()
        }
        this.last_position = {
            x: e.clientX,
            y: e.clientY
        }
    }

    _update_offset() {
        /* Set initial crop area */
        if (typeof this.crop_area == 'undefined') {
            console.log(this)
            this.crop_area = {
                left: this._convert_to_px(this.options.area ? this.options.area.left : '10%', this.img_el.clientWidth),
                top: this._convert_to_px(this.options.area ? this.options.area.top : '10%', this.img_el.clientHeight),
                width: this._convert_to_px(this.options.area ? this.options.area.width : '40%', this.img_el.clientWidth),
                height: this._convert_to_px(this.options.area ? this.options.area.height : '40%', this.img_el.clientHeight)
            }
            if (this.options.ratio) {
                this.crop_area.height = this.crop_area.width / this.options.ratio
            }
        }
        this.preview_offset = this.preview_inner.getBoundingClientRect()
    }

    /* Update overlay dimensions */
    _update_overlay() {
        /* Apply styles to crop overlay */
        this.crop_overlay.style.left = this.crop_area.left + 'px'
        this.crop_overlay.style.top = this.crop_area.top + 'px'
        this.crop_overlay.style.width = this.crop_area.width + 'px'
        this.crop_overlay.style.height = this.crop_area.height + 'px'
    }

    /* Fetch cropped image preview from server */
    _update_preview() {
        /* Scale crop dimensions to real image size */
        let scale = this.img_el ? (this.img_el.naturalWidth / this.img_el.clientWidth) : 1,
            img_options = {
                img: this.img_url
            }

        for (let dim in this.crop_area) {
            img_options[dim] = Math.round(this.crop_area[dim] * scale)
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
                if (!this.preview_img) {
                    this.preview_img = document.createElement('img')
                    this.preview_.appendChild(this.preview_img)
                }
                this.preview_img.src = 'data:image/jpeg;base64,' + base64_preview
            })
    }

    /* Convert value to px inside container */
    _convert_to_px(value, total) {
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

    /* Limit calls to a */
    _throttle(callback, limit) {
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
    generate_crop_template() {
        console.log(this)

        /* Upload button */
        this.upload_btn = document.createElement('button')
        this.upload_btn.classList.add('btn')
        this.upload_btn.classList.add('upload-btn')
        let _upload_img = document.createElement('img')
        _upload_img.alt = "Upload Image"
        _upload_img.src = "imgs/upload.svg"
        this.upload_btn.appendChild(_upload_img)

        /* Remove button */
        this.remove_btn = document.createElement('button')
        this.remove_btn.classList.add('btn')
        this.remove_btn.classList.add('remove-btn')
        let _remove_img = document.createElement('img')
        _remove_img.alt = "Remove"
        _remove_img.src = "imgs/remove.svg"
        this.remove_btn.appendChild(_remove_img)

        /* Form */
        this.input = document.createElement('input')
        this.input.type = 'file'
        this.input.classList.add('hidden')
        this.form = document.createElement('form')
        this.form.action = "/upload-file"
        this.form.appendChild(this.input)

        /* Image preview */
        this.preview = document.createElement('div')
        this.preview.classList.add('crop-preview')
        this.preview_inner = document.createElement('div')
        this.preview_inner.classList.add('crop-inner')
        let _placeholder = document.createElement('p')
        _placeholder.classList.add('hidden')
        _placeholder.textContent = "Please choose an image to start cropping..."
        this.preview.appendChild(_placeholder)
        this.preview.appendChild(this.preview_inner)

        /* Image */
        this.img_el = document.createElement('img')
        this.img_el.src = "/uploads/" + this.img_url
        this.img_el.alt = "crop preview"
        this.preview_inner.appendChild(this.img_el)

        /* Crop area */
        this.crop_overlay = document.createElement('div')
        this.crop_overlay.classList.add('crop-overlay')
        for (let i = 8; i > 0; i--) {
            let el = document.createElement('div')
            el.classList.add(i > 4 ? 'side' : 'corner')
            el.addEventListener('mousedown', i > 4 ? this._side_click_start.bind(this) : this._corner_click_start.bind(this), false)
            this.crop_overlay.appendChild(el)
        }
        this.preview_inner.appendChild(this.crop_overlay)

        /* Append everything to this.element */
        this.element.appendChild(this.upload_btn)
        this.element.appendChild(this.remove_btn)
        this.element.appendChild(this.preview)
        this.element.appendChild(this.form)
    }

    _mouseup() {
        this.last_position = null
        document.removeEventListener('mousemove', this._anchor_drag_i)
        document.removeEventListener('mousemove', this._area_drag_i)
        this._update_preview()
    }

    _area_mousedown(e) {
        if (!e.target.classList.contains('crop-overlay')) return
        this._area_drag_i = this._area_drag.bind(this)
        document.addEventListener('mousemove', this._area_drag_i, false)
    }

    /* Bind events */
    bind_events() {
        this.img_el.addEventListener('load', this._update_offset.bind(this))
        this.img_el.addEventListener('load', this._update_overlay.bind(this))
        this.img_el.addEventListener('load', this._update_preview.bind(this))
        this.upload_btn.addEventListener('click', this.choose_image.bind(this), false)
        this.remove_btn.addEventListener('click', this.remove_preview.bind(this), false)
        this.input.addEventListener('change', this.show_preview.bind(this), false)
        this.crop_overlay.addEventListener('mousedown', this._area_mousedown.bind(this), false)
        document.addEventListener('mouseup', this._mouseup.bind(this), false)
        var self = this
        window.addEventListener('resize', this._throttle(() => {
            self._update_offset.call(self)
            self._update_overlay.call(self)
            self.last_position = null
        }, 50), false)
    }

    /* Destroy instance of Crop */
    destroy() {
        this.img_el.removeEventListener('load', this._update_offset)
        this.img_el.removeEventListener('load', this._update_overlay)
        this.img_el.removeEventListener('load', this._update_preview)
        this.upload_btn.removeEventListener('click', this.choose_image)
        this.remove_btn.removeEventListener('click', this.remove_preview)
        this.input.removeEventListener('change', this.show_preview)
        this.crop_overlay.removeEventListener('mousedown', this._area_mousedown.bind(this))
        document.removeEventListener('mouseup', this._mouseup.bind(this))
        Array.from(this.crop_overlay.children).forEach(el => {
            el.removeEventListener('mousedown', el.classList.contains('side') ? this._side_click_start.bind(this) : this._corner_click_start.bind(this))
        })
    }
}

window.Crop = Crop