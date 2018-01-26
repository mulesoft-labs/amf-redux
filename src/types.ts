import { ApiSpecAction, ApiSpecState } from './api-spec-redux'
import AmfModelContainer from './AmfModelContainer'

/**
 * VisualDesignerAction: union of actions types used by every component
 */
export type ReduxAction =
  | ApiSpecAction

/**
 * VisualDesignerState: union of state types used by every component
 */
export type ReduxState = {
  apiSpec: ApiSpecState
}

/**
 * ExtraArgs passed to thunk action creators
 */

export type ExtraArgs = {
  amfModelContainer: AmfModelContainer
}

/**
 * GetState function passed to thunk action creators
 */

export type GetState = () => ReduxState

/**
 * Dispatch function used by redux in the visual designer
 */

export type PromiseAction = Promise<ReduxAction>
// eslint-disable-next-line
export type ThunkAction<T> = (dispatch: Dispatch, getState: GetState, eA: ExtraArgs) => T
export type Action = ReduxAction | PromiseAction | Array<ReduxAction>
export type AnyAction<T> = Action | ThunkAction<T>
export type Dispatch = <T>(action: AnyAction<T>) => T
