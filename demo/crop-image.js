const sharp = require('sharp')
const gm = require('gm')

/* Apply crop to image */
function generate_image(options) {
    return new Promise(function (resolve, reject) {
        if (options.left === null) {
            reject('Crop dimensions empty. Please provide left, top, width, height, img')
        }

        /* Get image dimensions */
        gm(__dirname + '/uploads/' + options.img).size((err, size) => {
            if (err) {
                reject(err)
            }

            /* Constrain crop area to image dimensions */
            options.height = Math.abs(options.top + options.height <= size.height ? options.height : size.height - options.top)
            options.width = Math.abs(options.left + options.width <= size.width ? options.width : size.width - options.left)

            resolve(
                sharp(__dirname + '/uploads/' + options.img)
                    .extract({ left: options.left, top: options.top, width: options.width, height: options.height })
                    .rotate()
                    .jpeg()
                    .toBuffer()
            )
        })
    })
}

module.exports.generate = generate_image
