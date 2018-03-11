const server = require('express')
const livereload = require('connect-livereload')
const bodyparser = require('body-parser')
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
app.use(server.static('../dist'))

/* Default route */
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.htm')
})

/* Load preview */
const load_preview = require(__dirname + '/load-preview.js')
app.post('/preview', function (request, response) {
    let img_data = load_preview.generate(request.body)
        .then(data => {
            response.end(data.toString('base64'), 'utf8', () => {
                console.log('done')
            })
        })
        .catch(err => {
            response.status(500)
            console.log('ending with error', err)
            response.end('There was a problem processing your request.', 'utf8', () => {
                console.log('error done')
            })
        })
})

app.listen(http_port)
console.log('Starting web server on port', http_port)
