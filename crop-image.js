let sharp = require('sharp')

/* Apply crop to image */
function generate_image(options) {
    let image = sharp(__dirname + '/test.png')
        .extract({ left: options.left, top: options.top, width: options.width, height: options.height })
        .rotate()
        .jpeg()
        .toBuffer()
    return image
}

module.exports.generate = generate_image
