import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { DevelopmentAccount } from '../src/models/developmentAccount'
import { DevelopmentAccountRelationship, DevelopmentAccountRelationshipRole, DevelopmentAccountRelationshipSorting } from '../src/models/developmentAccountRelationship'
import { DevelopmentAccountRelationshipRequest, DevelopmentAccountRelationshipRequestSorting } from '../src/models/developmentAccountRelationshipRequest'
import { User } from '../src/models/user'
import { createNewUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Development Account Relationship', function () {
  let metricsInstance: Metrics
  let user: User
  let demoUser: User
  let createdDevelopmentAccount: DevelopmentAccount
  let ownerDevelopmentAccountRelationship: DevelopmentAccountRelationship
  let developerDevelopmentAccountRelationship: DevelopmentAccountRelationship
  let createdDevelopmentAccountRelationshipRequest: DevelopmentAccountRelationshipRequest

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    demoUser = demoUserSession.user

    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user

    const developmentAccount = await user.createDevelopmentAccount({
      company: 'Keiser',
      address: '2470 S Cherry Ave, Fresno, CA 93706',
      websiteUrl: 'www.keiser.com'
    })

    createdDevelopmentAccount = developmentAccount
    const developmentAccountRelationships = await developmentAccount.getDevelopmentAccountRelationships()
    ownerDevelopmentAccountRelationship = developmentAccountRelationships[0]
  })

  after(async function () {
    await createdDevelopmentAccount.delete()
    await user?.delete()
    metricsInstance?.dispose()
  })

  it('can get a Development Account Relationship', async function () {
    const developmentAccountRelationship = await createdDevelopmentAccount.getDevelopmentAccountRelationship({
      id: ownerDevelopmentAccountRelationship.id
    })

    expect(developmentAccountRelationship).to.be.an('object')
    expect(developmentAccountRelationship.userId).to.be.equal(user.id)
    expect(developmentAccountRelationship.role).to.be.equal(DevelopmentAccountRelationshipRole.Owner)
  })

  it('cannot update a Personal Development Account Relationship', async function () {
    let extError

    try {
      await ownerDevelopmentAccountRelationship.update({
        role: DevelopmentAccountRelationshipRole.Developer
      })
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(ActionPreventedError.code)
  })

  it('can init a Development Account Relationship Request', async function () {
    const developmentAccountRelationshipRequest = await createdDevelopmentAccount.initializeDevelopmentAccountRelationshipRequest({
      email: 'demo@keiser.com',
      role: DevelopmentAccountRelationshipRole.Developer
    })

    expect(developmentAccountRelationshipRequest).to.be.an('object')
    expect(developmentAccountRelationshipRequest.code).to.not.equal(null)
    expect(developmentAccountRelationshipRequest.displayEmail).to.equal('demo@keiser.com')
    expect(developmentAccountRelationshipRequest.role).to.be.equal(DevelopmentAccountRelationshipRole.Developer)
    createdDevelopmentAccountRelationshipRequest = developmentAccountRelationshipRequest
  })

  it('can get a Development Account Relationship Request', async function () {
    const developmentAccountRelationshipRequest = await demoUser.getDevelopmentAccountRelationshipRequest({
      id: createdDevelopmentAccountRelationshipRequest.id,
      developmentAccountId: createdDevelopmentAccountRelationshipRequest.developmentAccountId
    })

    expect(developmentAccountRelationshipRequest).to.be.an('object')
    expect(developmentAccountRelationshipRequest.code).to.not.be.equal(null)
    expect(developmentAccountRelationshipRequest.developmentAccountId).to.be.equal(createdDevelopmentAccountRelationshipRequest.developmentAccountId)
    expect(developmentAccountRelationshipRequest.displayEmail).to.be.equal(createdDevelopmentAccountRelationshipRequest.displayEmail)
    createdDevelopmentAccountRelationshipRequest = developmentAccountRelationshipRequest
  })

  it('can list Development Account Relationship Requests', async function () {
    const developmentAccountRelationshipRequests = await createdDevelopmentAccount.getDevelopmentAccountRelationshipRequests({
      sort: DevelopmentAccountRelationshipRequestSorting.ID,
      ascending: true,
      limit: 10,
      offset: 0
    })

    expect(Array.isArray(developmentAccountRelationshipRequests)).to.equal(true)
    expect(developmentAccountRelationshipRequests.length).to.be.above(0)
    expect(developmentAccountRelationshipRequests.meta.sort).to.be.equal(DevelopmentAccountRelationshipRequestSorting.ID)
    expect(developmentAccountRelationshipRequests[0].code).to.not.equal(null)
    expect(developmentAccountRelationshipRequests[0].developmentAccountId).to.be.equal(createdDevelopmentAccount.id)
    expect(developmentAccountRelationshipRequests[0].displayEmail).to.be.equal('demo@keiser.com')
  })

  it('can fulfill a Development Account Relationship Request', async function () {
    const developmentAccountRelationship = await demoUser.fulfillDevelopmentAccountRelationshipRequest({
      code: createdDevelopmentAccountRelationshipRequest.code ?? '',
      shouldAuthorize: true
    })

    expect(developmentAccountRelationship).to.be.an('object')
    expect(developmentAccountRelationship.developmentAccountId).to.be.equal(createdDevelopmentAccount.id)
    expect(developmentAccountRelationship.userId).to.be.equal(demoUser.id)
    expect(developmentAccountRelationship.role).to.be.equal(DevelopmentAccountRelationshipRole.Developer)
    developerDevelopmentAccountRelationship = developmentAccountRelationship
  })

  it('cannot delete a Development Account Relationship as a Developer', async function () {
    let extError

    try {
      await (await demoUser.getDevelopmentAccount({ id: createdDevelopmentAccount.id })).delete()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(ActionPreventedError.code)
  })

  it('can list Development Account Relationships', async function () {
    const developmentAccountRelationships = await createdDevelopmentAccount.getDevelopmentAccountRelationships({
      sort: DevelopmentAccountRelationshipSorting.ID,
      ascending: true,
      limit: 10,
      offset: 0
    })

    expect(Array.isArray(developmentAccountRelationships)).to.equal(true)
    expect(developmentAccountRelationships.length).to.be.above(1)
    expect(developmentAccountRelationships.meta.sort).to.be.equal(DevelopmentAccountRelationshipSorting.ID)
    expect(developmentAccountRelationships[0].userId).to.be.equal(user.id)
    expect(developmentAccountRelationships[1].userId).to.be.equal(demoUser.id)
  })

  it('cannot delete Owner Development Account Relationship if there are no other Owner Relationships', async function () {
    let extError

    try {
      await ownerDevelopmentAccountRelationship.delete()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(ActionPreventedError.code)
  })

  it('can delete Development Account Relationship as an Owner', async function () {
    let extError

    await developerDevelopmentAccountRelationship.delete()

    try {
      await developerDevelopmentAccountRelationship.reload()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(UnknownEntityError.code)
  })
})
