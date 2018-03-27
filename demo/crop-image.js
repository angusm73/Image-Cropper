const sharp = require('sharp')
const gm = require('gm')

/* Apply crop to image */
function generate_image(options) {
    return new Promise(function (resolve, reject) {
        if (options.left === null) {
            return reject('Crop dimensions empty. Please provide left, top, width, height, img')
        }

        /* Get image dimensions */
        gm(__dirname + '/uploads/' + options.img).size((err, size) => {
            if (err) {
                return reject(err)
            }

            /* Constrain crop area to image dimensions */
            options.left = Math.abs(options.left ? options.left : 0)
            options.top = Math.abs(options.top ? options.top : 0)
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
