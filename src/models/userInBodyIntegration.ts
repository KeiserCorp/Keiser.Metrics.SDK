import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface UserInBodyIntegrationData {
  facilityRelationshipId: number
  inBodyId: string | null
  userToken: string
}

export interface UserInBodyIntegrationResponse extends AuthenticatedResponse {
  userInBodyIntegration: UserInBodyIntegrationData
}

export class UserInBodyIntegration extends Model {
  private _userInBodyIntegrationData: UserInBodyIntegrationData
  private _userId: number

  constructor (userInBodyIntegrationData: UserInBodyIntegrationData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._userInBodyIntegrationData = userInBodyIntegrationData
    this._userId = userId
  }

  private setUserInBodyIntegrationData (userInBodyIntegrationData: UserInBodyIntegrationData) {
    this._userInBodyIntegrationData = userInBodyIntegrationData
  }

  async reload () {
    const { userInBodyIntegration } = await this.action('userInBodyIntegration:show', { userId: this._userId }) as UserInBodyIntegrationResponse
    this.setUserInBodyIntegrationData(userInBodyIntegration)
    return this
  }

  async sync () {
    await this.action('userInBodyIntegration:sync', { userId: this._userId })
  }

  async delete () {
    await this.action('userInBodyIntegration:delete', { userId: this._userId })
  }

  get inBodyId () {
    return this._userInBodyIntegrationData.inBodyId
  }

  get userToken () {
    return this._userInBodyIntegrationData.userToken
  }
}
