let sharp = require('sharp')

/* Create crop area */
const crop_resizer = (area) => {
    return sharp()
        .resize(area.left, area.top)
        .crop(sharp.strategy.entropy)
        .on('error', err => {
            console.log(err)
        })
}

/* Apply crop to image */
function generate_image(options) {
    // console.log(crop_resizer(options))
    console.log(options)
    let image = sharp(__dirname + '/test.png')
        .extract({ left: options.left, top: options.top, width: 100, height: 100 })
        .rotate()
        .jpeg()
        .toBuffer()
    return image
}

module.exports.generate = generate_image
