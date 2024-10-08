const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:watcher')
const _ = require('lodash');

const Docker = require('dockerode')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const { Service } = require('./dao/service')

module.exports = async function () {
  const streamEvent = await docker.getEvents()

  streamEvent.on('data', async buffer => {
    try {
      const { Type, Action, Actor } = JSON.parse(buffer.toString())

      switch (Type) {
        case 'service':
          debug(`Docker event : ${Type}-${Action}`)
          dockerService.call(this, Type, Action, Actor)
          break;
        default:
          // Other docker type events are not managed
      }

    } catch (err) {
      process.stdout.write(`${err.message}\n`)
    }
  })
}

async function dockerService(Type, Action, Actor) {
  try {
    const id = Actor?.ID
    const serviceName = Actor?.Attributes?.name
    let service = new Service(serviceName)

    if (Action !== 'update' && Action !== 'remove' && Action !== 'create') {
      debug(`Unmanaged docker event type ${Type}-${Action} for ${Actor?.Attributes?.name}`)
    } else if (Action === 'remove') {
      if (this.servicesLoaded[service.name])
        this.emit(`${Type}-${Action}`, this.servicesLoaded[service.name])

    } else {
      const serviceInspect = await docker.getService(id).inspect()
      service.setMetadata(serviceInspect)

      if (service.isEnabled() && this.available(service, this.servicesLoaded)) {
        if (Action === 'create') {
          this.emit(`${Type}-${Action}`, service, this.servicesLoaded) // service-create
        } else if (Action === 'update') {
          if (serviceInspect.PreviousSpec && !compareDockerSpec(serviceInspect)) { // Verify if the service was previously running
            this.emit(`${Type}-${Action}`, service, this.servicesLoaded) // service-update
          } else {
            debug('No change detected for service update')
          }
        }
      } else if (this.servicesLoaded[service.name]) {
        this.emit(`${Type}-remove`, this.servicesLoaded[service.name]) // service-remove
      }
    }
  } catch (err) {
    console.error(err)
  }
}

function compareDockerSpec(serviceInspect) {
  const spec = serviceInspect?.Spec?.Labels
  const previousSpec = serviceInspect?.PreviousSpec?.Labels
  return _.isEqual(spec, previousSpec)
}
