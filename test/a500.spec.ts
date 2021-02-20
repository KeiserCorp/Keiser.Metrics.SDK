import { expect } from 'chai'

import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { MachineSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('A500', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let machineSession: MachineSession
  let userSession: UserSession

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can start machine session', async function () {
    const facilityConfiguration = await facility.getA500FacilityConfiguration()
    machineSession = await metricsInstance.authenticateWithMachineToken({ machineToken: facilityConfiguration.a500AuthorizationKey })

    expect(typeof machineSession).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler.machineToken).to.equal('string')
  })

  it('can use machine session to login user', async function () {
    userSession = await machineSession.userLogin({ primaryIdentification: '000000' })

    expect(typeof userSession).to.not.equal('undefined')
    expect(typeof userSession.user).to.not.equal('undefined')
    expect(userSession.user.id).to.equal(1)
  })
})
