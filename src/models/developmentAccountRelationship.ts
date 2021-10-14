import { Model } from "../model";
import { AuthenticatedResponse, SessionHandler } from "../session";

export enum DevelopmentAccountRelationshipSorting {
  ID = "id",
  UserId = "userId",
  Role = "role",
}

export enum DevelopmentAccountRelationshipRole {
  Owner = "owner",
  Developer = "developer",
}

export interface DevelopmentAccountRelationshipData {
  id: number;
  userId: number;
  developmentAccountId: number;
  role: DevelopmentAccountRelationshipRole;
}

export interface DevelopmentAccountRelationshipResponse
  extends AuthenticatedResponse {
  developmentAccountRelationship: DevelopmentAccountRelationshipData;
}

export interface DevelopmentAccountRelationshipListResponse
  extends AuthenticatedResponse {
  developmentAccountRelationships: DevelopmentAccountRelationshipData[];
}

export class developmentAccountRelationship extends Model {
  protected _developmentAccountRelationshipData: DevelopmentAccountRelationshipData;

  constructor(
    developmentAccountRelationshipData: DevelopmentAccountRelationshipData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler);
    this._developmentAccountRelationshipData =
      developmentAccountRelationshipData;
  }

  get id() {
    return this._developmentAccountRelationshipData.id;
  }

  get userId() {
    return this._developmentAccountRelationshipData.userId;
  }

  get developmentAccountId() {
    return this._developmentAccountRelationshipData.developmentAccountId;
  }

  get role() {
    return this._developmentAccountRelationshipData.role;
  }

  async getDevelopmentAccountRelationship(params: {
    id: number;
    developmentAccountId: number;
  }) {
    const { developmentAccountRelationship } = (await this.action(
      "developmentAccountRelationship:show",
      { ...params }
    )) as DevelopmentAccountRelationshipResponse;
    return developmentAccountRelationship;
  }

  async getDevelopmentAccountRelationships(options: {
    id: number;
    developmentAccountId: number;
  }) {
    const { developmentAccountRelationships } = (await this.action(
      "developmentAccountRelationship:list",
      { ...options }
    )) as DevelopmentAccountRelationshipListResponse;
    return developmentAccountRelationships;
  }

  async delete() {
    await this.action("developmentAccountRelationship", {
      id: this.id,
      developmentAccountId: this.developmentAccountId,
    });
  }
}
