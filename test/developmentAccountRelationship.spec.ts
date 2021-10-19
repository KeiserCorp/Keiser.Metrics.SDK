import { expect } from 'chai'

import Metrics from '../src/core'
// import { UnknownEntityError } from '../src/error'
import { DevelopmentAccount } from '../src/models/developmentAccount'
import { DevelopmentAccountRelationship, DevelopmentAccountRelationshipRole, DevelopmentAccountRelationshipSorting } from '../src/models/developmentAccountRelationship'
import { DevelopmentAccountRelationshipRequest, DevelopmentAccountRelationshipRequestSorting } from '../src/models/developmentAccountRelationshipRequest'
import { User } from '../src/models/user'
import { createNewUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe.only('Development Account Relationship', function () {
  let metricsInstance: Metrics
  let user: User
  let demoUser: User
  let createdDevelopmentAccount: DevelopmentAccount
  let createdDevelopmentAccountRelationship: DevelopmentAccountRelationship
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
    createdDevelopmentAccountRelationship = developmentAccountRelationships[0]
  })

  after(async function () {
    await user?.delete()
    metricsInstance?.dispose()
  })

  it('can get a Development Account Relationship', async function () {
    const developmentAccountRelationship = await createdDevelopmentAccount.getDevelopmentAccountRelationship({
      id: createdDevelopmentAccountRelationship.id
    })

    expect(developmentAccountRelationship).to.be.an('object')
    expect(developmentAccountRelationship.userId).to.be.equal(user.id)
    expect(developmentAccountRelationship.role).to.be.equal(DevelopmentAccountRelationshipRole.Owner)
  })

  it('can init a Development Account Relationship Request', async function () {
    const developmentAccountRelationshipRequest = await createdDevelopmentAccount.initDevelopmentAccountRelationshipRequest({
      email: 'testemail@keiser.com',
      role: DevelopmentAccountRelationshipRole.Developer
    })

    expect(developmentAccountRelationshipRequest).to.be.an('object')
    expect(developmentAccountRelationshipRequest.code).to.not.equal(null)
    expect(developmentAccountRelationshipRequest.displayEmail).to.equal('testemail@keiser.com')
    expect(developmentAccountRelationshipRequest.role).to.be.equal(DevelopmentAccountRelationshipRole.Developer)
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
    expect(developmentAccountRelationshipRequests[0].code).to.not.equal(null)
    expect(developmentAccountRelationshipRequests[0].developmentAccountId).to.be.equal(createdDevelopmentAccount.id)
    expect(developmentAccountRelationshipRequests[0].displayEmail).to.be.equal('testemail@keiser.com')
  })

  it('can fulfill a Development Account Relationship Request', async function () {
    const developmentAccountRelationship = await demoUser.fulfillDevelopmentAccountRelationshipRequest({
      code: createdDevelopmentAccountRelationshipRequest.code,
      shouldAuthorize: true
    })

    expect(developmentAccountRelationship).to.be.an('object')
    expect(developmentAccountRelationship.developmentAccountId).to.be.equal(createdDevelopmentAccount.id)
    expect(developmentAccountRelationship.userId).to.be.equal(demoUser.id)
    expect(developmentAccountRelationship.role).to.be.equal(DevelopmentAccountRelationshipRole.Developer)
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
    expect(developmentAccountRelationships[0].userId).to.be.equal(user.id)
    expect(developmentAccountRelationships[1].userId).to.be.equal(demoUser.id)
  })
})
