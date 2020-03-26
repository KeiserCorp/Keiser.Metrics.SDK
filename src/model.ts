import { SessionHandler } from './session'

export class Model {
  protected sessionHandler: SessionHandler

  constructor (sessionHandler: SessionHandler) {
    this.sessionHandler = sessionHandler
  }

  protected action (action: string, params: Object = {}) {
    return this.sessionHandler.action(action, params)
  }
}
