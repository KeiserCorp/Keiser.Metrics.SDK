import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { Gender, Units } from '../constants'

export interface ProfileData {
  updatedAt: string
  name: string | null
  birthday: string | null
  gender: string | null
  language: string | null
  units: string | null
}

export interface ProfileResponse extends AuthenticatedResponse {
  profile: ProfileData
}

export class Profile extends Model {
  private _profileData: ProfileData
  private _userId: number

  constructor (profileData: ProfileData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._profileData = profileData
    this._userId = userId
  }

  private setProfileData (profileData: ProfileData) {
    Object.assign(this._profileData, profileData)
  }

  async reload () {
    const { profile } = await this.action('profile:show', { userId: this._userId }) as ProfileResponse
    this.setProfileData(profile)
    return this
  }

  async update (params: {
    name?: string | null
    birthday?: string | null
    gender?: Gender | null
    language?: string | null
    units?: Units | null
  }) {
    const { profile } = await this.action('profile:update', { userId: this._userId, ...params }) as ProfileResponse
    this.setProfileData(profile)
    return this
  }

  get updatedAt () {
    return new Date(this._profileData.updatedAt)
  }

  get name () {
    return this._profileData.name
  }

  get birthday () {
    return this._profileData.birthday
  }

  get gender () {
    return this._profileData.gender ? this._profileData.gender as Gender : null
  }

  get language () {
    return this._profileData.language
  }

  get units () {
    return this._profileData.units ? this._profileData.units as Units : null
  }
}
