const server = require('express')
const livereload = require('connect-livereload')
const bodyparser = require('body-parser')
const fs = require('fs')
const app = module.exports.app = exports.app = server()
const http_port = 1337

/* Setup livereloading */
app.use(livereload({
    basePath: '../dist',
    port: 35729
}))

/* Parse request as url encoded data */
app.use(bodyparser.urlencoded({
    extended: true
}))

/* Parse url request data into a json object - request.body */
app.use(bodyparser.json())

/* Front end public files */
app.use('/', server.static('../dist'))
app.use('/uploads', server.static('./uploads'))

/* Default route - index */
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.htm')
})

/* Upload image */
app.post('/upload', function (request, response) {
    let img_name = request.body.file_name,
        upload_path = __dirname + '/uploads/' + img_name,
        img_data = request.body.data.replace(/^data:image\/\w+;base64,/, ''),
        base64_img = new Buffer(img_data, 'base64')

    fs.writeFile(upload_path, base64_img, (err) => {
        if (err) {
            console.error('[Error] Image failed to upload - ', err)
            response.end('error')
        }
        console.log('[Success] Image uploaded - ' + img_name)
        response.end(img_name)
    })
})

/* Load preview */
const Cropper = require(__dirname + '/crop-image.js')
app.post('/preview', function (request, response) {
    Cropper.generate(request.body)
        .then(data => {
            response.end(data.toString('base64'), 'utf8')
        })
        .catch(err => {
            response.status(500)
            console.error('ending with error', err)
            response.end('There was a problem processing your request.', 'utf8')
        })
})

app.listen(http_port)
console.log('Starting web server on port', http_port)
