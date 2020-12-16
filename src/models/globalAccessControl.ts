import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { User, UserData } from './user'

export const enum Permission {
  View = 'view',
  Edit = 'edit'
}

export const enum MSeriesGuidedSessionPermission {
  Access = 'access',
  Publish = 'publish'
}

export const enum ExercisePermission {
  Edit = 'edit'
}

export const enum AnalyticPermission {
  View = 'view'
}

export const enum GlobalAccessControlSorting {
  ID = 'id',
  Name = 'name'
}

export interface GlobalAccessControlData {
  userId: number
  userRights: Permission | null
  exerciseRights: ExercisePermission | null
  mSeriesGuidedSessionRights: MSeriesGuidedSessionPermission | null
  facilityRights: Permission | null
  licenseRights: Permission | null
  accessControlRights: Permission | null
  resqueRights: Permission | null
  analyticRights: AnalyticPermission | null
  user?: UserData
}

export interface GlobalAccessControlSecretData {
  secret: string
  uri: string
}

export interface GlobalAccessControlResponse extends AuthenticatedResponse {
  globalAccessControl: GlobalAccessControlData
}

export interface GlobalAccessControlCreationResponse extends AuthenticatedResponse {
  globalAccessControl: GlobalAccessControlData
  globalAccessControlSecret: GlobalAccessControlSecretData
}

export interface GlobalAccessControlSecretResponse extends AuthenticatedResponse {
  globalAccessControlSecret: GlobalAccessControlSecretData
}

export interface GlobalAccessControlListResponse extends AuthenticatedResponse {
  globalAccessControls: GlobalAccessControlData[]
  globalAccessControlsMeta: GlobalAccessControlListResponseMeta
}

export interface GlobalAccessControlListResponseMeta extends ListMeta {
  name: string | undefined
  sort: GlobalAccessControlSorting
}

export class GlobalAccessControls extends ModelList<GlobalAccessControl, GlobalAccessControlData, GlobalAccessControlListResponseMeta> {
  constructor (globalAccessControls: GlobalAccessControlData[], globalAccessControlsMeta: GlobalAccessControlListResponseMeta, sessionHandler: SessionHandler) {
    super(GlobalAccessControl, globalAccessControls, globalAccessControlsMeta, sessionHandler)
  }
}

export class GlobalAccessControl extends Model {
  protected _globalAccessControlData: GlobalAccessControlData

  constructor (globalAccessControlData: GlobalAccessControlData, sessionHandler: SessionHandler, globalAccessControlSecretData?: GlobalAccessControlSecretData) {
    super(sessionHandler)
    this._globalAccessControlData = globalAccessControlData
  }

  protected setGlobalAccessControlData (globalAccessControlData: GlobalAccessControlData) {
    this._globalAccessControlData = globalAccessControlData
  }

  async reload () {
    const { globalAccessControl } = await this.action('globalAccessControl:show', { userId: this.userId }) as GlobalAccessControlResponse
    this.setGlobalAccessControlData(globalAccessControl)
    return this
  }

  async update (params: { userRights?: Permission, exerciseRights?: ExercisePermission, mSeriesGuidedSessionRights?: MSeriesGuidedSessionPermission, facilityRights?: Permission, licenseRights?: Permission, accessControlRights?: Permission, resqueRights?: Permission, analyticRights?: AnalyticPermission }) {
    const { globalAccessControl } = await this.action('globalAccessControl:update', { ...params, userId: this.userId }) as GlobalAccessControlResponse
    this.setGlobalAccessControlData(globalAccessControl)
    return this
  }

  async delete () {
    await this.action('globalAccessControl:delete', { userId: this.userId })
  }

  async recreateSecret () {
    const { globalAccessControlSecret } = await this.action('globalAccessControl:recreateSecret', { userId: this.userId }) as GlobalAccessControlSecretResponse
    return { globalAccessControlSecret }
  }

  get userId () {
    return this._globalAccessControlData.userId
  }

  get userRights () {
    return this._globalAccessControlData.userRights
  }

  get exerciseRights () {
    return this._globalAccessControlData.exerciseRights
  }

  get mSeriesGuidedSessionRights () {
    return this._globalAccessControlData.mSeriesGuidedSessionRights
  }

  get facilityRights () {
    return this._globalAccessControlData.facilityRights
  }

  get licenseRights () {
    return this._globalAccessControlData.licenseRights
  }

  get accessControlRights () {
    return this._globalAccessControlData.accessControlRights
  }

  get resqueRights () {
    return this._globalAccessControlData.resqueRights
  }

  get analyticRights () {
    return this._globalAccessControlData.analyticRights
  }

  eagerUser () {
    return typeof this._globalAccessControlData.user !== 'undefined' ? new User(this._globalAccessControlData.user, this.sessionHandler) : undefined
  }
}
