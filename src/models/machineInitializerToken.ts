export interface MachineInitializerTokenData {
  initializerToken: string
  url: string
  isEncrypted: boolean
}

export interface MachineInitializerOTPTokenData extends MachineInitializerTokenData {
  expiresAt: string
}

export class MachineInitializerToken {
  private readonly _machineInitializerTokenData: MachineInitializerTokenData

  constructor (machineInitializerTokenData: MachineInitializerTokenData) {
    this._machineInitializerTokenData = machineInitializerTokenData
  }

  get initializerToken () {
    return this._machineInitializerTokenData.initializerToken
  }

  get url () {
    return this._machineInitializerTokenData.url
  }

  get isEncrypted () {
    return this._machineInitializerTokenData.isEncrypted
  }
}

export class MachineInitializerOTPToken extends MachineInitializerToken {
  private readonly _expiresAt: string

  constructor (machineInitializerTokenData: MachineInitializerOTPTokenData) {
    super(machineInitializerTokenData)
    this._expiresAt = machineInitializerTokenData.expiresAt
  }

  get expiresAt () {
    return new Date(this._expiresAt)
  }
}
