import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { Muscle, MuscleBodyPart, MuscleGroup, MuscleSorting, PrivilegedMuscle } from '../src/models/muscle'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let newMuscle: PrivilegedMuscle
  let existingMuscle: Muscle

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsAdminInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    adminSession = await metricsAdminInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
  })

  after(function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can list available muscles', async function () {
    const muscles = await userSession.getMuscles()
    existingMuscle = muscles[0]

    expect(Array.isArray(muscles)).to.equal(true)
    expect(muscles.length).to.be.above(0)
    expect(muscles.meta.sort).to.equal(MuscleSorting.ID)
  })

  it('can reload muscle', async function () {
    expect(existingMuscle).to.be.an('object')
    if (typeof existingMuscle !== 'undefined') {
      await existingMuscle.reload()
      expect(existingMuscle).to.be.an('object')
    }
  })

  it('can get specific muscle', async function () {
    expect(existingMuscle).to.be.an('object')
    if (typeof existingMuscle !== 'undefined') {
      const muscle = await userSession.getMuscle({ id: existingMuscle.id })

      expect(muscle).to.be.an('object')
      expect(muscle.id).to.equal(existingMuscle.id)
    }
  })

  it('can list muscles with privileges', async function () {
    const muscles = await adminSession.getMuscles()

    expect(Array.isArray(muscles)).to.equal(true)
    expect(muscles.length).to.be.above(0)
    expect(muscles.meta.sort).to.equal(MuscleSorting.ID)
    expect(typeof muscles[0].update).to.equal('function')
  })

  it('can create muscle', async function () {
    const muscle = {
      name: newNameGen(),
      group: MuscleGroup.UpperBack,
      part: MuscleBodyPart.Back
    }
    newMuscle = await adminSession.createMuscle(muscle)

    expect(newMuscle).to.be.an('object')
    expect(newMuscle.name).to.equal(newMuscle.name)
    expect(newMuscle.group).to.equal(MuscleGroup.UpperBack)
    expect(newMuscle.part).to.equal(MuscleBodyPart.Back)
  })

  it('can update muscle', async function () {
    const newName = newNameGen()
    await newMuscle.update({ name: newName, group: MuscleGroup.Neck, part: MuscleBodyPart.Shoulders })
    expect(newMuscle).to.be.an('object')
    expect(newMuscle.name).to.equal(newName)
    expect(newMuscle.group).to.equal(MuscleGroup.Neck)
    expect(newMuscle.part).to.equal(MuscleBodyPart.Shoulders)
  })

  it('can delete muscle', async function () {
    let extError

    await newMuscle.delete()

    try {
      await newMuscle.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
