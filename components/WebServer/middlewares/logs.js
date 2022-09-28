const debug = require('debug')('saas-api-gateway:webserver:middlewares:logs')

const {
  LogsError,
} = require(`${process.cwd()}/components/WebServer/error/exception/logs`)

module.exports = async (req, res, next) => {
  try {
    //req.payload.service contains docker label and other information
    debug('Logs middlewares is enable')

    if (typeof next === 'function') next()
    else return
  } catch (error) {
    res.status(error.status).send({ message: error.message })
  }
}