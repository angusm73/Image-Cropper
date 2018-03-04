'use strict';

function Crop(el) {
    var _this = this,
        _arguments = arguments;

    /* Get DOM node from selector */
    this.element = document.querySelector(el);

    /* Get all other elements */
    var upload_btn = this.element.querySelector('.upload-btn');
    var remove_btn = this.element.querySelector('.remove-btn');
    var input = this.element.querySelector('input[type=file].hidden');
    var preview = this.element.querySelector('.crop-preview');
    var preview_inner = preview.querySelector('.crop-inner');
    var img_el = preview_inner.querySelector('img');
    var crop_overlay = document.createElement('div');

    this.crop_area = {
        top: 40,
        bottom: 50,
        left: 40,
        right: 400

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
        document.addEventListener('mouseup', function () {
            preview_inner.removeEventListener('mousemove', click_move, false);
        }, false);
        e.preventDefault();
        return false;
    };

    var preview_offset,
        _update_offset = function _update_offset() {
        preview_offset = preview_inner.getBoundingClientRect();
    };
    setTimeout(_update_offset, 100);
    var click_move = function click_move(e) {
        if (cur_side.index == 1) {
            // Top
            var _top = Math.round(e.pageY - preview_offset.top);
            if (_top < preview_inner.clientHeight - _this.crop_area.bottom && _top > 0) {
                _this.crop_area.top = _top;
            }
        } else if (cur_side.index == 3) {
            // Bottom
            var _bottom = Math.round(preview_offset.top + preview_inner.clientHeight - e.pageY);
            if (_bottom < preview_inner.clientHeight - _this.crop_area.top && _bottom > 0) {
                _this.crop_area.bottom = _bottom;
            }
        } else if (cur_side.index == 4) {
            // Left
            var _left = Math.round(e.pageX - preview_offset.left);
            if (_left < preview_inner.clientWidth - _this.crop_area.right && _left > 0) {
                _this.crop_area.left = _left;
            }
        } else {
            // Right
            var _right = Math.round(preview_offset.left + preview_inner.clientWidth - e.pageX);
            if (_right < preview_inner.clientWidth - _this.crop_area.left && _right > 0) {
                _this.crop_area.right = _right;
            }
        }
        _update_overlay();
    };

    var start_drag = function start_drag(e) {
        if (e.target.classList.contains('side')) return;
        preview_inner.addEventListener('mousemove', drag_crop_area, false);
        document.addEventListener('mouseup', function () {
            preview_inner.removeEventListener('mousemove', drag_crop_area, false);
            last_position = null;
        }, false);
    };

    var last_position;
    var drag_crop_area = function drag_crop_area(e) {
        if (last_position) {
            var deltaX = e.clientX - last_position.x,
                deltaY = e.clientY - last_position.y;
            _this.crop_area.left += deltaX;
            _this.crop_area.right -= deltaX;
            _this.crop_area.top += deltaY;
            _this.crop_area.bottom -= deltaY;
            _update_overlay();
        }
        last_position = {
            x: e.clientX,
            y: e.clientY
        };
    };

    var _update_overlay = function _update_overlay() {
        crop_overlay.style.left = _this.crop_area.left + 'px';
        crop_overlay.style.top = _this.crop_area.top + 'px';
        crop_overlay.style.width = preview_inner.clientWidth - _this.crop_area.left - _this.crop_area.right + 'px';
        crop_overlay.style.height = preview_inner.clientHeight - _this.crop_area.top - _this.crop_area.bottom + 'px';
    };

    /* Limit calls to a function */
    var throttle = function throttle(callback, limit) {
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
    };

    /* Bind events */
    var bind_events = function bind_events() {
        upload_btn.addEventListener('click', choose_image, false);
        remove_btn.addEventListener('click', remove_preview, false);
        input.addEventListener('change', show_preview, false);
        crop_overlay.addEventListener('mousedown', start_drag, false);
        window.addEventListener('resize', throttle(function () {
            _update_offset();
            _update_overlay();
            last_position = null;
        }, 50), false);
    };

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
