import { expect } from 'chai'
import Metrics from '../src'

const restEndpoint = 'http://localhost:8000/api'
const socketEndpoint = 'ws://localhost:8000/ws'

mocha.setup('bdd')
mocha.growl()

describe('Core', function () {

  describe('Construction', function () {

    it('can create instance with properties', function () {
      const metricsInstance = new Metrics({
        restEndpoint,
        socketEndpoint
      })

      expect(metricsInstance).to.be.an('object')
      expect(metricsInstance.persistConnection).to.equal(true)
      metricsInstance.dispose()
    })

    it('can create instance with defaults', function () {
      const metricsInstance = new Metrics()

      expect(metricsInstance).to.be.an('object')
      expect(metricsInstance.persistConnection).to.equal(true)
      metricsInstance.dispose()
    })

    it('can create non-persistent connection instance', function () {
      const metricsInstance = new Metrics({
        restEndpoint,
        socketEndpoint,
        persistConnection: false
      })

      expect(metricsInstance).to.be.an('object')
      expect(metricsInstance.persistConnection).to.equal(false)
      metricsInstance.dispose()
    })
  })

  describe('Disposing', function () {

    it('can dispose instance', function () {
      const metricsInstance = new Metrics()
      expect(metricsInstance.persistConnection).to.equal(true)
      metricsInstance.dispose()
      expect(metricsInstance.persistConnection).to.equal(false)
    })

  })

})

describe('Connection', function () {

  describe('Socket (Dev Server)', function () {
    let metricsInstance: Metrics

    beforeEach(function () {
      metricsInstance = new Metrics({
        restEndpoint,
        socketEndpoint,
        persistConnection: true
      })
    })

    afterEach(function () {
      metricsInstance.dispose()
    })

    it('can create a socket connection to server', async function () {
      this.timeout(1000)

      expect(metricsInstance.persistConnection).to.be.equal(true)
      expect(metricsInstance.socketConnected).to.equal(false) // This doesn't have to work, just seeing if it ever fails

      const result = await (new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.one(event => {
          if (event.socketConnection) {
            resolve(true)
          }
        })
      }))

      expect(result).to.equal(true)
      expect(metricsInstance.socketConnected).to.equal(true)
    })

    it('ensures connection is closed after dispose', async function () {
      this.timeout(2000)

      const openResult = await (new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.one(event => {
          if (event.socketConnection) {
            resolve(true)
          }
        })
      }))

      expect(openResult).to.equal(true)
      expect(metricsInstance.socketConnected).to.equal(true)

      const closedResultPromise = new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.one(event => {
          if (!event.socketConnection) {
            resolve(true)
          }
        })
      })

      metricsInstance.dispose()
      const closedResult = await closedResultPromise

      expect(closedResult).to.equal(true)
      expect(metricsInstance.socketConnected).to.equal(false)
    })

    it('can make request to server after connection event', async function () {
      this.timeout(1000)

      const result = await(new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
      }))

      expect(result).to.equal(true)
      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

    it('can make request to server before connection event', async function () {
      this.timeout(1000)

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

  })

  describe('Socket (Prod Server)', function () {
    let metricsInstance: Metrics

    beforeEach(function () {
      metricsInstance = new Metrics({
        persistConnection: true
      })
    })

    afterEach(function () {
      metricsInstance.dispose()
    })

    it('can create a socket connection to server', async function () {
      this.timeout(1000)

      expect(metricsInstance.persistConnection).to.be.equal(true)
      expect(metricsInstance.socketConnected).to.equal(false) // This doesn't have to work, just seeing if it ever fails

      const result = await (new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.one(event => {
          if (event.socketConnection) {
            resolve(true)
          }
        })
      }))

      expect(result).to.equal(true)
      expect(metricsInstance.socketConnected).to.equal(true)
    })

    it('can make request to server', async function () {
      this.timeout(1000)

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

  })

  describe('REST (Dev Server)', function () {
    let metricsInstance: Metrics

    beforeEach(function () {
      metricsInstance = new Metrics({
        restEndpoint,
        socketEndpoint,
        persistConnection: false
      })
    })

    afterEach(function () {
      metricsInstance.dispose()
    })

    it('does not automatically create a connection to server', async function () {
      this.timeout(1100)

      expect(metricsInstance.persistConnection).to.be.equal(false)
      expect(metricsInstance.socketConnected).to.equal(false)

      const result = await (new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.subscribe(event => {
          if (event.socketConnection) {
            resolve(true)
          }
        })

        setTimeout(() => resolve(false), 1000)
      }))

      expect(result).to.equal(false)
      expect(metricsInstance.socketConnected).to.equal(false)
    })

    it('can make request to server', async function () {
      this.timeout(1000)

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

  })

  describe('REST (Prod Server)', function () {
    let metricsInstance: Metrics

    beforeEach(function () {
      metricsInstance = new Metrics({
        persistConnection: false
      })
    })

    afterEach(function () {
      metricsInstance.dispose()
    })

    it('can make request to server', async function () {
      this.timeout(1000)

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

  })

})

mocha.run()
