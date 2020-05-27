import { ListMeta } from '../model'
import { AuthenticatedResponse } from '../session'

export const enum SessionPlanSorting {
  ID = 'id',
  StartedAt = 'startedAt',
  EndedAt = 'endedAt'
}

// To-Do: Expand SessionPlanData
export interface SessionPlanData {
  id: number
}

export interface SessionPlanResponse extends AuthenticatedResponse {
  sessionPlan: SessionPlanData
}

export interface SessionPlanListResponse extends AuthenticatedResponse {
  sessionPlans: SessionPlanData[]
  sessionPlansMeta: SessionPlanListResponseMeta
}

export interface SessionPlanListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  active: boolean | undefined
  sort: SessionPlanSorting
}
