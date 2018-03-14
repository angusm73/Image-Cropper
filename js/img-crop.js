'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function Crop(options) {
    var self = this;

    /* Scope all elements */
    var upload_btn = void 0,
        remove_btn = void 0,
        form = void 0,
        input = void 0,
        preview = void 0,
        preview_inner = void 0,
        img_el = void 0,
        crop_overlay = void 0;

    /* Get DOM node from selector */
    this.element = document.querySelector((typeof options === 'undefined' ? 'undefined' : _typeof(options)) == 'object' ? options.element : options);

    /* Get preview if set */
    if (options.preview) {
        this.preview = document.querySelector(options.preview);
    }

    /* ---------------- */
    /*  Crop Functions  */
    /* ---------------- */

    /* Open file browser */
    function choose_image() {
        input.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }

    /* Show image preview */
    function show_preview() {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                img_el.style.display = 'block';
                img_el.src = e.target.result;
                preview.classList.remove('no-img');
                preview.children[0].classList.add('hidden');
            };
            reader.readAsDataURL(input.files[0]);
        }
        _update_offset();
    }

    /* Remove image preview */
    function remove_preview() {
        img_el.style.display = 'none';
        preview.classList.add('no-img');
        preview.children[0].classList.remove('hidden');
        input.remove();
        input = document.createElement('input');
        input.type = 'file';
        input.classList.add('hidden');
        input.addEventListener('change', show_preview, false);
        self.element.querySelector('form').appendChild(input);
    }

    var cur_side;
    function click_down(e) {
        cur_side = {
            el: e.target,
            index: Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        };
        document.addEventListener('mousemove', click_move, false);
        e.preventDefault();
        return false;
    }

    function _update_offset() {
        /* Set initial crop area */
        if (typeof self.crop_area == 'undefined') {
            self.crop_area = {
                left: convert_to_px(options.area ? options.area.left : '10px', img_el.clientWidth),
                top: convert_to_px(options.area ? options.area.top : '10px', img_el.clientHeight),
                width: convert_to_px(options.area ? options.area.width : '50px', img_el.clientWidth),
                height: convert_to_px(options.area ? options.area.height : '50px', img_el.clientHeight)
            };
        }
        self.preview_offset = preview_inner.getBoundingClientRect();
    }
    function click_move(e) {
        if (cur_side.index == 1) {
            // Top
            var _top = e.pageY - self.preview_offset.top;
            if (_top < preview_inner.clientHeight && _top > 0) {
                var _old_top = self.crop_area.top;
                self.crop_area.top = Math.round(_top);
                self.crop_area.height -= self.crop_area.top - _old_top;
            }
        } else if (cur_side.index == 3) {
            // Bottom
            var _bottom = self.preview_offset.top + preview_inner.clientHeight - e.pageY;
            if (_bottom < preview_inner.clientHeight - self.crop_area.top && _bottom > 0) {
                self.crop_area.height = Math.round(preview_inner.clientHeight - self.crop_area.top - _bottom);
            }
        } else if (cur_side.index == 4) {
            // Left
            var _left = e.pageX - self.preview_offset.left;
            if (_left < preview_inner.clientWidth && _left > 0) {
                var _old_left = self.crop_area.left;
                self.crop_area.left = Math.round(_left);
                self.crop_area.width -= self.crop_area.left - _old_left;
            }
        } else {
            // Right
            var _right = self.preview_offset.left + preview_inner.clientWidth - e.pageX;
            if (_right < preview_inner.clientWidth - self.crop_area.left && _right > 0) {
                self.crop_area.width = Math.round(preview_inner.clientWidth - self.crop_area.left - _right);
            }
        }
        _update_overlay();
    }

    function drag_crop_area(e) {
        if (self.last_position) {
            /* Get new crop position */
            var deltaX = e.clientX - self.last_position.x,
                deltaY = e.clientY - self.last_position.y,
                new_pos = {
                left: self.crop_area.left + deltaX < 0 ? 0 : self.crop_area.left + deltaX,
                top: self.crop_area.top + deltaY < 0 ? 0 : self.crop_area.top + deltaY

                /* Restrict to inside crop area */
            };if (new_pos.left > preview_inner.clientWidth - self.crop_area.width) new_pos.left = self.crop_area.left;
            if (new_pos.top > preview_inner.clientHeight - self.crop_area.height) new_pos.top = self.crop_area.top;

            /* Update overlay then render */
            self.crop_area = Object.assign(self.crop_area, new_pos);
            _update_overlay();
        }
        self.last_position = {
            x: e.clientX,
            y: e.clientY
        };
    }

    /* Update overlay dimensions */
    function _update_overlay() {
        /* Constrain to image preview */
        self.crop_area.left = Math.max(self.crop_area.left, 0);
        self.crop_area.top = Math.max(self.crop_area.top, 0);
        self.crop_area.width = self.crop_area.left + self.crop_area.width < preview_inner.clientWidth ? self.crop_area.width : preview_inner.clientWidth - self.crop_area.left;
        self.crop_area.height = self.crop_area.top + self.crop_area.height < preview_inner.clientHeight ? self.crop_area.height : preview_inner.clientHeight - self.crop_area.top;

        /* Apply styles to crop overlay */
        crop_overlay.style.left = self.crop_area.left + 'px';
        crop_overlay.style.top = self.crop_area.top + 'px';
        crop_overlay.style.width = self.crop_area.width + 'px';
        crop_overlay.style.height = self.crop_area.height + 'px';
    }

    /* Fetch cropped image preview from server */
    function _update_preview() {
        var scale = img_el.naturalWidth / img_el.clientWidth,
            _real_crop_area = {};

        for (var dim in self.crop_area) {
            _real_crop_area[dim] = Math.round(self.crop_area[dim] * scale);
        }

        var options = {
            method: 'POST',
            body: JSON.stringify(_real_crop_area),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };
        fetch('/preview', options).then(function (response) {
            return response.text();
        }).then(function (base64_preview) {
            if (!self.preview_img) {
                self.preview_img = document.createElement('img');
                self.preview.appendChild(self.preview_img);
            }
            self.preview_img.src = 'data:image/jpeg;base64,' + base64_preview;
        });
    }

    /* Convert value to px inside container */
    function convert_to_px(value, total) {
        /* Validate value, convert value to string */
        if (typeof value == 'undefined') return 0;
        value += '';
        var number = parseFloat(value.replace(/[^-\d]+/, '')),
            unit = value.replace(/[-\d]+/, '');
        if (unit == '%') return total * number / 100;else if (unit == 'px') return number < total ? number : total;else return number;
    }

    /* Limit calls to a function */
    function throttle(callback, limit) {
        var _arguments = arguments;

        var wait = false;
        return function () {
            if (!wait) {
                callback.apply(null, _arguments);
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, limit);
            }
        };
    }

    /* Generate markup for img cropper */
    function generate_crop_template() {
        /* Upload button */
        upload_btn = document.createElement('button');
        upload_btn.classList.add('btn');
        upload_btn.classList.add('upload-btn');
        upload_btn.innerHTML = "Upload Image";

        /* Remove button */
        remove_btn = document.createElement('button');
        remove_btn.classList.add('btn');
        remove_btn.classList.add('remove-btn');
        remove_btn.innerHTML = "Remove";

        /* Form */
        input = document.createElement('input');
        input.type = 'file';
        input.classList.add('hidden');
        form = document.createElement('form');
        form.action = "/upload-file";
        form.appendChild(input);

        /* Image preview */
        preview = document.createElement('div');
        preview.classList.add('crop-preview');
        preview_inner = document.createElement('div');
        preview_inner.classList.add('crop-inner');
        var _placeholder = document.createElement('p');
        _placeholder.classList.add('hidden');
        _placeholder.textContent = "Please choose an image to start cropping...";
        preview.appendChild(_placeholder);
        preview.appendChild(remove_btn);
        preview.appendChild(preview_inner);

        /* Image */
        img_el = document.createElement('img');
        img_el.src = "/test.png";
        img_el.alt = "crop preview";
        preview_inner.appendChild(img_el);

        /* Crop area */
        crop_overlay = document.createElement('div');
        crop_overlay.classList.add('crop-overlay');
        for (var i = 4; i > 0; i--) {
            var side = document.createElement('div');
            side.classList.add('side');
            side.addEventListener('mousedown', click_down, false);
            crop_overlay.appendChild(side);
        }
        preview_inner.appendChild(crop_overlay);

        /* Append everything to self.element */
        self.element.appendChild(upload_btn);
        self.element.appendChild(preview);
        self.element.appendChild(form);
    }

    /* Bind events */
    function bind_events() {
        img_el.addEventListener('load', _update_offset);
        img_el.addEventListener('load', _update_overlay);
        img_el.addEventListener('load', _update_preview);
        upload_btn.addEventListener('click', choose_image, false);
        remove_btn.addEventListener('click', remove_preview, false);
        input.addEventListener('change', show_preview, false);
        crop_overlay.addEventListener('mousedown', function (e) {
            if (e.target.classList.contains('side')) return;
            document.addEventListener('mousemove', drag_crop_area, false);
        }, false);
        document.addEventListener('mouseup', function () {
            self.last_position = null;
            document.removeEventListener('mousemove', click_move, false);
            document.removeEventListener('mousemove', drag_crop_area, false);
            _update_preview();
        }, false);
        window.addEventListener('resize', throttle(function () {
            _update_offset();
            _update_overlay();
            self.last_position = null;
        }, 50), false);
    }

    /* Initialise Crop */
    (function () {
        generate_crop_template();
        bind_events();
    })();

    /* Public functions */
    this.choose_image = choose_image;

    return this;
}
//# sourceMappingURL=img-crop.js.map
