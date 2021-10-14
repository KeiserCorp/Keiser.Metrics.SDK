import { Model } from "../model";
import { AuthenticatedResponse, SessionHandler } from "../session";

export enum DevelopmentAccountSorting {
  ID = "id",
  Company = "company",
}

export interface DevelopmentAccountData {
  id: number;
  company: string;
  address: string;
  websiteUrl: string;
}

export interface DevelopmentAccountResponse extends AuthenticatedResponse {
  developmentAccount: DevelopmentAccountData;
}

export interface DevelopmentAccountListResponse extends AuthenticatedResponse {
  developmentAccounts: DevelopmentAccountData[];
}

export class developmentAccount extends Model {
  protected _developmentAccountData: DevelopmentAccountData;

  constructor(
    developmentAccountData: DevelopmentAccountData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler);
    this._developmentAccountData = developmentAccountData;
  }

  get id() {
    return this._developmentAccountData.id;
  }

  get company() {
    return this._developmentAccountData.company;
  }

  get address() {
    return this._developmentAccountData.address;
  }

  get websiteUrl() {
    return this._developmentAccountData.websiteUrl;
  }

  async getDevelopmentAccount(params: { id: number }) {
    const { developmentAccount } = (await this.action(
      "developmentAccount:show",
      { ...params }
    )) as DevelopmentAccountResponse;
    return developmentAccount;
  }

  async getDevelopmentAccounts(options: {
    sort: DevelopmentAccountSorting;
    ascending: boolean;
    limit: number;
    offset: number;
  }) {
    const { developmentAccounts } = (await this.action(
      "developmentAccount:list",
      { ...options }
    )) as DevelopmentAccountListResponse;
    return developmentAccounts;
  }

  async delete(params: { id: number }) {
    await this.action("developmentAccount:delete", { ...params });
  }
}
