import { expect } from 'chai'

import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { getAvailableMachineAdjustments } from '../src/lib/machineAdjustments'
import { MachineAdjustment, MachineAdjustmentSorting } from '../src/models/machineAdjustment'
import { User } from '../src/models/user'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Machine Adjustment', function () {
  let metricsInstance: Metrics
  let user: User
  let createdMachineAdjustment: MachineAdjustment

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    user = demoUserSession.user
  })

  after(async function () {
    metricsInstance?.dispose()
  })

  it('can show available adjustments for a strength machine', async function () {
    const machineAdjustments = getAvailableMachineAdjustments('002099')

    expect(machineAdjustments).to.be.an('object')
    expect(Array.isArray(machineAdjustments.adjustments)).to.be.equal(true)
    expect(machineAdjustments.primaryAdjustmentIndex).to.not.be.equal('undefined')
  })

  it('can create a user machine adjustment', async function () {
    const machineAdjustment = await user.createMachineAdjustment({
      model: '002099',
      seat: '1',
      leftPosition: '4'
    })

    expect(machineAdjustment).to.be.an('object')
    expect(machineAdjustment.userId).to.be.equal(user.id)
    expect(machineAdjustment.model).to.be.equal('002099')
    expect(machineAdjustment.seat).to.be.equal('1')
    expect(machineAdjustment.leftPosition).to.be.equal('4')

    createdMachineAdjustment = machineAdjustment
  })

  it('can show a user machine adjustment', async function () {
    const machineAdjustment = await user.getMachineAdjustment({
      id: createdMachineAdjustment.id
    })

    expect(machineAdjustment).to.be.an('object')
    expect(machineAdjustment.userId).to.be.equal(user.id)
    expect(machineAdjustment.model).to.be.equal(createdMachineAdjustment.model)
    expect(machineAdjustment.leftPosition).to.be.equal(createdMachineAdjustment.leftPosition)
  })

  it('can update a user machine adjustment', async function () {
    const machineAdjustment = await createdMachineAdjustment.update({
      seat: '3'
    })

    expect(machineAdjustment).to.be.an('object')
    expect(machineAdjustment.userId).to.be.equal(user.id)
    expect(machineAdjustment.model).to.be.equal(createdMachineAdjustment.model)
    expect(machineAdjustment.seat).to.be.equal('3')
    expect(machineAdjustment.leftPosition).to.be.equal(createdMachineAdjustment.leftPosition)
  })

  it('can list user machine adjustments', async function () {
    const machineAdjustments = await user.getMachineAdjustments()

    expect(Array.isArray(machineAdjustments)).to.equal(true)
    expect(machineAdjustments.length).to.be.above(0)
    expect(machineAdjustments.meta.sort).to.equal(MachineAdjustmentSorting.ID)
  })

  it('can reload a user machine adjustment', async function () {
    expect(createdMachineAdjustment).to.be.an('object')
    if (typeof createdMachineAdjustment !== 'undefined') {
      await createdMachineAdjustment.reload()
      expect(createdMachineAdjustment).to.be.an('object')
    }
  })

  it('can delete a user machine adjustment', async function () {
    let extError

    await createdMachineAdjustment.delete()

    try {
      await createdMachineAdjustment.reload()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(UnknownEntityError.code)
  })
})
