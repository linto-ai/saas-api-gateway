const debug = require('debug')('saas-api-gateway:webserver')
const Component = require(`../component.js`)

const express = require('express')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')

const WebServerErrorHandler = require('./error/handler')


class WebServer extends Component {
    constructor(app) {
        super(app)
        this.app = express()
        this.router = express.Router()
        this.id = this.constructor.name

        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            next()
        })

        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(bodyParser.json())
        this.app.use(fileUpload())

        // require('./routes/router.js')(this)  //TODO: Gateway do'nt have any API (only service discovery)

        this.app.set('trust proxy', true)

        WebServerErrorHandler.init(this)

        this.app.listen(process.env.SAAS_API_GATEWAY_HTTP_PORT, function () {
            debug(`Express launch on ${process.env.SAAS_API_GATEWAY_HTTP_PORT}`)
        })
        return this.init()
    }
}

module.exports = app => new WebServer(app)