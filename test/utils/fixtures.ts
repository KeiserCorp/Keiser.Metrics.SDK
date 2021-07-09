import Metrics, { MetricsAdmin, MetricsSSO } from '../../src'
import { UserResponse } from '../../src/models/user'
import { UserSession } from '../../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { randomCharacterSequence, randomEmailAddress } from './dummy'

export function getMetricsInstance () {
  return new Metrics({
    restEndpoint: DevRestEndpoint,
    socketEndpoint: DevSocketEndpoint,
    persistConnection: true
  })
}

export function getMetricsSSOInstance () {
  return new MetricsSSO({
    restEndpoint: DevRestEndpoint,
    socketEndpoint: DevSocketEndpoint,
    persistConnection: true
  })
}

export function getMetricsAdminInstance () {
  return new MetricsAdmin({
    restEndpoint: DevRestEndpoint,
    socketEndpoint: DevSocketEndpoint,
    persistConnection: true
  })
}

export async function getDemoUserSession (metrics: Metrics) {
  const metricsSSO = getMetricsSSOInstance()
  const exchangeableUserSession = await metricsSSO.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: true })
  metricsSSO.dispose()
  return await metrics.authenticateWithExchangeToken({ exchangeToken: exchangeableUserSession.exchangeToken })
}

export async function getAuthenticatedUserSession (metrics: Metrics, params: { email: string, password: string }) {
  const metricsSSO = getMetricsSSOInstance()
  const exchangeableUserSession = await metricsSSO.authenticateWithCredentials({ ...params, refreshable: true, requiresElevated: false })
  metricsSSO.dispose()
  return await metrics.authenticateWithExchangeToken({ exchangeToken: exchangeableUserSession.exchangeToken })
}

export async function createNewUserSession (metrics: Metrics, params?: { email: string, password: string }) {
  if (typeof params === 'undefined') {
    params = {
      email: randomEmailAddress(),
      password: randomCharacterSequence(20)
    }
  }
  const metricsSSO = getMetricsSSOInstance()
  const userResponse = await metricsSSO.action('dev:userCreate', params) as UserResponse
  metricsSSO.dispose()
  return await metrics.authenticateWithToken({ token: userResponse.refreshToken ?? '' })
}

export async function elevateUserSession (metricsAdmin: MetricsAdmin, userSession: UserSession) {
  const metricsSSO = getMetricsSSOInstance()
  const exchangeableUserSession = await metricsSSO.elevateUserSession(userSession, { otpToken: '000000', refreshable: true })
  metricsSSO.dispose()
  return await metricsAdmin.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableUserSession.exchangeToken })
}

export async function setActiveEmployeeFacility (userSession: UserSession) {
  const facilities = await userSession.user.getFacilityEmploymentRelationships({ limit: 1 })
  const facility = facilities[0]?.eagerFacility()
  if (typeof facility === 'undefined') {
    throw new Error('No Employee Facility Available')
  }
  await facility.setActive()
  return facility
}
