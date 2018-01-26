import {ReduxAction, ThunkAction} from './types'
import {Map} from 'immutable'
import * as amf from 'amf-client-js'

/* AMF methods */

export enum AmfActionType {
  AmfParseStarted = 'AmfParseStarted',
  AmfParseEnded = 'AmfParseEnded',
  AmfParseFailed = 'AmfParseFailed',
}

export type AmfParseAction = {
  type: AmfActionType.AmfParseStarted | AmfActionType.AmfParseEnded | AmfActionType.AmfParseFailed
}

export const parseRaml = (raml: string): ThunkAction<Promise<{}>> =>
  (dispatch, getState, {amfModelContainer}) => {
    dispatch({type: AmfActionType.AmfParseStarted})

    return amfModelContainer.parser
      .then(parser =>
        new Promise((resolve, reject) =>
          parser.parseString(raml, {
            success: (doc: amf.model.document.Document) => {
              amfModelContainer.setModel(doc)
              dispatch(updateModelFromAmf())
              dispatch({type: AmfActionType.AmfParseEnded})

              resolve()
            },
            error: (exception) => {
              dispatch({type: AmfActionType.AmfParseFailed})
              reject(exception)
            }
          })
        )
      )
  }

export const updateModelFromAmf = (): ThunkAction<void> =>
  (dispatch, getState, {amfModelContainer}) => {
    if (amfModelContainer.model) {
      dispatch(updateState({
        ...amfExtractionMap.get(TitleField)(amfModelContainer.model),
        ...amfExtractionMap.get(VersionField)(amfModelContainer.model),
        ...amfExtractionMap.get(BaseUriField)(amfModelContainer.model),
      }))
    }
  }

/* AMF methods end **/

/* Helpers **/

const getLocation = (href: string) => {
  const location = document.createElement('a')
  location.href = href
  return location
}

/* Helpers end **/

export enum ApiSpecActionType {
  UpdateState = 'UpdateState',
}

export const updateField = (field: Field, value: string): ThunkAction<void> =>
  (dispatch, getState, {amfModelContainer}) => {
    if (!amfModelContainer.model) return
    if (!amfModificationMap.has(field))
      throw Error(`Field: ${field.fieldName} from ${field.entityName} has not modification handler`)
    if (!amfExtractionMap.has(field))
      throw Error(`Field: ${field.fieldName} from ${field.entityName} has not extraction handler`)

    amfModificationMap.get(field)(amfModelContainer.model, value)
    dispatch(updateState(amfExtractionMap.get(field)(amfModelContainer.model)))
  }

export type UpdateState = {
  type: ApiSpecActionType.UpdateState
  payload: Partial<ApiSpecState>
}
export const updateState = (apiSpecState: Partial<ApiSpecState>): UpdateState => ({
  type: ApiSpecActionType.UpdateState, payload: apiSpecState
})

export type ApiSpecAction =
  | UpdateState
  | AmfParseAction

export enum EntityName {
  Root = 'Root',
  Resource = 'Resource',
}

export enum FieldName {
  Title = 'Title',
  Version = 'Version',
  BaseUri = 'BaseUri',
  ResourceUrl = 'ResourceUrl',
}

export class Field {
  constructor(public entityName: EntityName, public fieldName: FieldName) {
  }

  equals(other?: Field): boolean {
    return !!other
      && this.entityName === other.entityName
      && this.fieldName === other.fieldName
  }
}

const field = (entityName: EntityName, fieldName: FieldName) => new Field(entityName, fieldName)

export const TitleField = field(EntityName.Root, FieldName.Title)
export const VersionField = field(EntityName.Root, FieldName.Version)
export const BaseUriField = field(EntityName.Root, FieldName.BaseUri)

type AmfModificationFn = (model: amf.model.document.Document, value: string) => void
const amfModificationMap = Map<Field, AmfModificationFn>()
  .set(TitleField, (model, value) => (model as any).encodes.withName(value))
  .set(VersionField, (model, value) => (model as any).encodes.withVersion(value))
  .set(BaseUriField, (model, value) =>
    (model as any).encodes
      .withHost(getLocation(value).host)
      .withBasePath(getLocation(value).pathname))

type AmfExtractionFn = (model: amf.model.document.Document) => Partial<ApiSpecState>
const amfExtractionMap = Map<Field, AmfExtractionFn>()
  .set(TitleField, model => ({title: (model as any).encodes.name}))
  .set(VersionField, model => ({version: (model as any).encodes.version}))
  .set(BaseUriField, model => ({baseUri: 'http://' + (model as any).encodes.host + (model as any).encodes.basePath}))

export type Resource = {
  id: string
  url: string
}

export type ApiSpecState = {
  title: string
  version: string
  baseUri: string
  resources: Map<string, Resource>,
}

const initialState: ApiSpecState = {
  title: '',
  version: '',
  baseUri: '',
  resources: Map<string, Resource>(),
}

export const reducer = (state: ApiSpecState = initialState, action: ReduxAction): ApiSpecState => {
  if (action.type === ApiSpecActionType.UpdateState) return {...state, ...action.payload}

  else
    return state
}

export default reducer
