'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function Crop(options) {
    var _this = this;

    /* Get DOM node from selector */
    this.element = document.querySelector((typeof options === 'undefined' ? 'undefined' : _typeof(options)) == 'object' ? options.element : options);
    var self = this;

    /* Get all other elements */
    var upload_btn = this.element.querySelector('.upload-btn');
    var remove_btn = this.element.querySelector('.remove-btn');
    var form = this.element.querySelector('form');
    var input = form.querySelector('input[type=file].hidden');
    var preview = this.element.querySelector('.crop-preview');
    var preview_inner = preview.querySelector('.crop-inner');
    var img_el = preview_inner.querySelector('img');
    var crop_overlay = document.createElement('div');

    /* Get preview if set */
    if (options.preview) {
        this.preview = document.querySelector(options.preview);
    }

    /* Debuggging... */
    this.crop_area = {
        top: 40,
        bottom: 50,
        left: 40,
        right: 400
        /* End debugging... */

        /* Open file browser */
    };var choose_image = function choose_image() {
        input.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    };

    /* SHOW image preview */
    var show_preview = function show_preview() {
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
    };

    /* REMOVE image preview */
    var remove_preview = function remove_preview() {
        img_el.style.display = 'none';
        preview.classList.add('no-img');
        preview.children[0].classList.remove('hidden');
        input.remove();
        input = document.createElement('input');
        input.type = 'file';
        input.classList.add('hidden');
        input.addEventListener('change', show_preview, false);
        _this.element.querySelector('form').appendChild(input);
    };

    var cur_side;
    var click_down = function click_down(e) {
        cur_side = {
            el: e.target,
            index: Array.prototype.indexOf.call(e.target.parentElement.children, e.target) + 1
        };
        preview_inner.addEventListener('mousemove', click_move, false);
        e.preventDefault();
        return false;
    };

    var preview_offset,
        _update_offset = function _update_offset() {
        preview_offset = preview_inner.getBoundingClientRect();
    };
    setTimeout(_update_offset, 100);
    function click_move(e) {
        if (cur_side.index == 1) {
            // Top
            var _top = Math.round(e.pageY - preview_offset.top);
            if (_top < preview_inner.clientHeight - this.crop_area.bottom && _top > 0) {
                this.crop_area.top = _top;
            }
        } else if (cur_side.index == 3) {
            // Bottom
            var _bottom = Math.round(preview_offset.top + preview_inner.clientHeight - e.pageY);
            if (_bottom < preview_inner.clientHeight - this.crop_area.top && _bottom > 0) {
                this.crop_area.bottom = _bottom;
            }
        } else if (cur_side.index == 4) {
            // Left
            var _left = Math.round(e.pageX - preview_offset.left);
            if (_left < preview_inner.clientWidth - this.crop_area.right && _left > 0) {
                this.crop_area.left = _left;
            }
        } else {
            // Right
            var _right = Math.round(preview_offset.left + preview_inner.clientWidth - e.pageX);
            if (_right < preview_inner.clientWidth - this.crop_area.left && _right > 0) {
                this.crop_area.right = _right;
            }
        }
        _update_overlay();
    }

    var last_position;
    function drag_crop_area(e) {
        if (last_position) {
            var deltaX = e.clientX - last_position.x,
                deltaY = e.clientY - last_position.y;
            self.crop_area.left += deltaX;
            self.crop_area.right -= deltaX;
            self.crop_area.top += deltaY;
            self.crop_area.bottom -= deltaY;
            _update_overlay();
        }
        last_position = {
            x: e.clientX,
            y: e.clientY
        };
    }

    function _update_overlay() {
        crop_overlay.style.left = self.crop_area.left + 'px';
        crop_overlay.style.top = self.crop_area.top + 'px';
        crop_overlay.style.width = preview_inner.clientWidth - self.crop_area.left - self.crop_area.right + 'px';
        crop_overlay.style.height = preview_inner.clientHeight - self.crop_area.top - self.crop_area.bottom + 'px';
    }

    function _update_preview() {
        var options = {
            method: 'POST',
            body: JSON.stringify(self.crop_area),
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

    /* Bind events */
    function bind_events() {
        upload_btn.addEventListener('click', choose_image, false);
        remove_btn.addEventListener('click', remove_preview, false);
        input.addEventListener('change', show_preview, false);
        crop_overlay.addEventListener('mousedown', function (e) {
            if (e.target.classList.contains('side')) return;
            preview_inner.addEventListener('mousemove', drag_crop_area, false);
        }, false);
        document.addEventListener('mouseup', function () {
            last_position = null;
            preview_inner.removeEventListener('mousemove', click_move, false);
            preview_inner.removeEventListener('mousemove', drag_crop_area, false);
            _update_preview();
        }, false);
        window.addEventListener('resize', throttle(function () {
            _update_offset();
            _update_overlay();
            last_position = null;
        }, 50), false);
    }

    /* Initialise preview */
    (function () {
        for (var i = 4; i > 0; i--) {
            var side = document.createElement('div');
            side.classList.add('side');
            side.addEventListener('mousedown', click_down, false);
            crop_overlay.appendChild(side);
        }
        crop_overlay.classList.add('crop-overlay');

        preview_inner.appendChild(crop_overlay);
        if (!img_el) {
            img_el = document.createElement('img');
            preview_inner.appendChild(img_el);
        } else {
            img_el.addEventListener('load', _update_overlay);
        }

        bind_events();
    })();

    this.choose_image = choose_image;

    return this;
}
//# sourceMappingURL=img-crop.js.map
