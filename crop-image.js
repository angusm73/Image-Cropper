let sharp = require('sharp')

/* Apply crop to image */
function generate_image(options) {
    if (options.left === null) {
        return Promise.resolve('')
    }
    let image = sharp(__dirname + '/uploads/' + options.img)
        .extract({ left: options.left, top: options.top, width: options.width, height: options.height })
        .rotate()
        .jpeg()
        .toBuffer()
    return image
}

module.exports.generate = generate_image
