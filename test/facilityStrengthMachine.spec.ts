import { expect } from 'chai'

import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityStrengthMachine, FacilityStrengthMachineSorting } from '../src/models/facilityStrengthMachine'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Strength Machine', function () {
  const echipData = {
    1621: {
      position: {
        chest: null,
        rom2: null,
        rom1: null,
        seat: null
      },
      sets: [
        {
          version: '4D2C55A5',
          serial: '0730 2015 1323 2541',
          time: new Date(),
          resistance: 41,
          precision: 'int',
          units: 'lb',
          repetitions: 3,
          peak: 154,
          work: 90.56,
          distance: null,
          seat: null,
          rom2: null,
          rom1: null,
          chest: null,
          test: null
        }
      ]
    }
  }

  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let addedMachine: FacilityStrengthMachine

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can add facility strength machine', async function () {
    addedMachine = await privilegedFacility.createFacilityStrengthMachine({
      strengthMachineId: 1000,
      model: '1121',
      version: '4D2C55A5',
      serial: '0816 2020 1234 5678',
      location: 'Next to the water fountain'
    })

    expect(addedMachine).to.be.an('object')
    expect(addedMachine.model).to.equal('001121')
    const strengthMachine = addedMachine.eagerStrengthMachine()
    expect(strengthMachine).to.be.an('object')
    expect(strengthMachine?.id).to.equal(1000)
  })

  it('can list facility strength machines', async function () {
    const strengthMachines = await privilegedFacility.getFacilityStrengthMachines()

    expect(Array.isArray(strengthMachines)).to.equal(true)
    expect(strengthMachines.meta.sort).to.equal(FacilityStrengthMachineSorting.Model)
  })

  it('can filter facility strength machines', async function () {
    const strengthMachines = await privilegedFacility.getFacilityStrengthMachines({ model: '1121' })

    expect(Array.isArray(strengthMachines)).to.equal(true)
    expect(strengthMachines.meta.sort).to.equal(FacilityStrengthMachineSorting.Model)
    expect(strengthMachines.length).to.be.above(0)
  })

  it('can reload facility strength machine', async function () {
    await addedMachine.reload()

    expect(addedMachine).to.be.an('object')
    expect(addedMachine.model).to.equal('001121')
  })

  it('can get specific facility strength machine', async function () {
    const machine = await privilegedFacility.getFacilityStrengthMachine({ id: addedMachine.id })

    expect(machine).to.be.an('object')
    expect(machine.id).to.equal(addedMachine.id)
    expect(machine.model).to.equal(addedMachine.model)
  })

  it('can update facility strength machine', async function () {
    addedMachine = await addedMachine.update({ location: 'Next to spin studio' })

    expect(addedMachine).to.be.an('object')
    expect(addedMachine.model).to.equal('001121')
    expect(addedMachine.location).to.equal('Next to spin studio')
  })

  it('can delete facility strength machine', async function () {
    let extError

    await addedMachine.delete()

    try {
      await addedMachine.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

  it('can add facility strength machines by eChip', async function () {
    const importResults = await privilegedFacility.createFacilityStrengthMachinesFromEChip({ echipData })

    expect(importResults).to.be.an('object')
    expect(Array.isArray(importResults.strengthMachines)).to.equal(true)
    expect(Array.isArray(importResults.unknownMachines)).to.equal(true)
    expect(importResults.strengthMachines[0]).to.be.an('object')
    expect(importResults.strengthMachines[0].model).to.equal('001621')

    await importResults.strengthMachines[0].delete()
  })
})
