import { SessionHandler } from './session'

export class Model {
  private _sessionHandler: SessionHandler

  constructor (sessionHandler: SessionHandler) {
    this._sessionHandler = sessionHandler
  }

  protected action (action: string, params: Object = {}) {
    return this._sessionHandler.action(action, params)
  }
}
