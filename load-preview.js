let sharp = require('sharp')

const generate_image = (options) => {
    let data
    let image = sharp(__dirname + '/test.png')
        .rotate()
        .resize(420)
        .jpeg()
        .toBuffer()
    return image
}

module.exports.generate = generate_image
