const server = require('express')
const livereload = require('connect-livereload')
const app = module.exports.app = exports.app = server()
const http_port = 1337

app.use(livereload({
    basePath: '../dist',
    port: 35729
}))

app.use(server.static('../dist'))

/* Default route */
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.htm')
})

/* Load preview */
const load_preview = require(__dirname + '/load-preview.js')
app.get('/preview', (request, response) => {
    let img_data = load_preview.generate(request)
        .then(data => {
            console.log(data.toString('base64').substr(0, 200))
            response.write(data ? data.toString('base64') : '')
            response.send()
        })
        .catch(err => {
            response.status(500)
            response.send('There was a problem processing your request.')
        })
})

app.listen(http_port)
console.log('Starting web server on port', http_port)
