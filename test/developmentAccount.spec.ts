import { expect } from 'chai'

import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { DevelopmentAccount, DevelopmentAccountSorting } from '../src/models/developmentAccount'
import { User } from '../src/models/user'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe.only('Development Account', function () {
  let metricsInstance: Metrics
  let user: User
  let createdDevelopmentAccount: DevelopmentAccount

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can create a Development Account', async function () {
    const developmentAccount = await user.createDevelopmentAccount({
      company: 'Keiser',
      address: '2470 S Cherry Ave, Fresno, CA 93706',
      websiteUrl: 'www.keiser.com'
    })

    expect(developmentAccount).to.be.an('object')
    expect(developmentAccount.company).to.be.equal('Keiser')
    expect(developmentAccount.address).to.be.equal('2470 S Cherry Ave, Fresno, CA 93706')
    expect(developmentAccount.websiteUrl).to.be.equal('www.keiser.com')
    createdDevelopmentAccount = developmentAccount
  })

  it('can get a DevelopmentAccount', async function () {
    const developmentAccount = await user.getDevelopmentAccount({ id: createdDevelopmentAccount.id })

    expect(developmentAccount).to.be.an('object')
    expect(developmentAccount.company).to.be.equal('Keiser')
    expect(developmentAccount.address).to.be.equal('2470 S Cherry Ave, Fresno, CA 93706')
    expect(developmentAccount.websiteUrl).to.be.equal('www.keiser.com')
  })

  it('can update a Development Account', async function () {
    const developmentAccount = await (await user.getDevelopmentAccount({ id: createdDevelopmentAccount.id })).update({
      company: 'Peloton',
      address: '125W 25th Street 11th Floor New York, NY 10001',
      websiteUrl: 'www.onepeloton.com'
    })

    expect(developmentAccount).to.be.an('object')
    expect(developmentAccount.company).to.be.equal('Peloton')
    expect(developmentAccount.address).to.be.equal('125W 25th Street 11th Floor New York, NY 10001')
    expect(developmentAccount.websiteUrl).to.be.equal('www.onepeloton.com')
    createdDevelopmentAccount = developmentAccount
  })

  it('can reload a Development Account', async function () {
    expect(createdDevelopmentAccount).to.be.an('object')
    if (typeof createdDevelopmentAccount !== 'undefined') {
      await createdDevelopmentAccount.reload()
      expect(createdDevelopmentAccount).to.be.an('object')
      expect(createdDevelopmentAccount.company).to.be.equal('Peloton')
      expect(createdDevelopmentAccount.address).to.be.equal('125W 25th Street 11th Floor New York, NY 10001')
      expect(createdDevelopmentAccount.websiteUrl).to.be.equal('www.onepeloton.com')
    }
  })

  it('can list DevelopmentAccounts', async function () {
    const developmentAccounts = await user.getDevelopmentAccounts({
      sort: DevelopmentAccountSorting.ID,
      ascending: true,
      limit: 10,
      offset: 0
    })

    expect(Array.isArray(developmentAccounts)).to.equal(true)
    expect(developmentAccounts.length).to.be.above(0)
    expect(developmentAccounts[0].company).to.be.equal('Peloton')
  })

  it('can delete a Development Account', async function () {
    let extError

    await createdDevelopmentAccount.delete()

    try {
      await createdDevelopmentAccount.reload()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(UnknownEntityError.code)
  })
})
