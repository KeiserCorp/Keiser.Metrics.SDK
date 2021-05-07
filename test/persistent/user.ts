import { MetricsAdmin, MetricsSSO } from '../../src'
import { Units } from '../../src/constants'
import { Gender } from '../../src/models/profile'
import { DemoEmail, DemoPassword } from '../constants'

export async function CreateUser (connection: MetricsSSO, emailAddress: string) {
  const createUserResponse = await connection.createUser({ email: emailAddress, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
  const authenticationResponse = await connection.userFulfillment({ authorizationCode: createUserResponse.authorizationCode, password: 'password', acceptedTermsRevision: '2019-01-01', name: 'Test', birthday: '1990-01-01', gender: Gender.Male, language: 'en', units: Units.Imperial })
  return await exchangeToken(connection, authenticationResponse.exchangeToken)
}

export async function AuthenticatedUser (connection: MetricsSSO, refreshable = false) {
  const authExchangeToken = await connection.authenticate({ email: DemoEmail, password: DemoPassword, refreshable })
  return await exchangeToken(connection, authExchangeToken.exchangeToken)
}

export async function AdminUser (connection: MetricsAdmin) {
  return await connection.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
}

async function exchangeToken (connection: MetricsSSO, exchangeToken: string) {
  return await connection.authenticateWithExchangeToken({ exchangeToken })
}
