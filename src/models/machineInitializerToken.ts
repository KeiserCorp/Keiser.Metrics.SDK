export class MachineInitializerToken {
  protected _initializerToken: string
  private readonly _metricsApiUrl: string

  constructor (initializerToken: string, metricsApiUrl: string) {
    this._initializerToken = initializerToken
    this._metricsApiUrl = metricsApiUrl
  }

  get initializerToken () {
    return this._initializerToken
  }

  get metricsApiUrl () {
    return this._metricsApiUrl
  }
}

export class MachineInitializerJWTToken extends MachineInitializerToken {
  private readonly _jwtToken: string

  constructor (initializerToken: string) {
    const [url, jwt] = initializerToken.substr(initializerToken.indexOf(':') + 1).split(',')
    super(initializerToken, url)
    this._jwtToken = jwt
  }

  get token () {
    return this._jwtToken
  }
}

export class MachineInitializerOTPToken extends MachineInitializerToken {
  private readonly _otp: string

  constructor (initializerToken: string) {
    const [url, otp] = initializerToken.substr(initializerToken.indexOf(':') + 1).split(',')
    super(initializerToken, url)
    this._otp = otp
  }

  get token () {
    return `otp:${this._otp}`
  }
}
