import { Model } from "../model";
import { AuthenticatedResponse, SessionHandler } from "../session";

export enum ApplicationSorting {
  ID = "id",
  ApplicationName = "applicationName",
}

export interface ApplicationData {
  id: number;
  developmentAccountId: number;
  applicationName: string;
  redirectUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface ApplicationResponse extends AuthenticatedResponse {
  application: ApplicationData;
}

export interface ApplicationListResponse extends AuthenticatedResponse {
  applications: ApplicationData[];
}

export class Application extends Model {
  protected _applicationData: ApplicationData;

  constructor(
    applicationData: ApplicationData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler);
    this._applicationData = applicationData;
  }

  get id() {
    return this._applicationData.id;
  }

  get developmentAccountId() {
    return this._applicationData.developmentAccountId;
  }

  get applicationName() {
    return this._applicationData.applicationName;
  }

  get redirectUrl() {
    return this._applicationData.redirectUrl;
  }

  get clientId() {
    return this._applicationData.clientId;
  }

  async getApplication() {
    const { application } = (await this.action("application:show", {
      applicationId: this.id,
    })) as ApplicationResponse;
    return application;
  }

  async getApplications(options: {
    developmentAccountId: number;
    sort: ApplicationSorting;
    ascending: boolean;
    limit: number;
    offset: number;
  }) {
    const { applications } = (await this.action("application:list", {
      ...options,
    })) as ApplicationListResponse;
    return applications;
  }

  async delete(params: { id: number; developmentAccountId: number }) {
    await this.action("application:delete", { ...params });
  }
}
