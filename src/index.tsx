import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {ExtraArgs} from './types'
import {applyMiddleware, combineReducers, createStore} from 'redux'

import * as apiSpec from './api-spec-redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import AmfModelContainer from './AmfModelContainer'
import {parseRaml} from './api-spec-redux'

const extraArgs: ExtraArgs = {
  amfModelContainer: new AmfModelContainer()
}

const middlewares = [thunk.withExtraArgument(extraArgs)]

const rootReducer = combineReducers({
  apiSpec: apiSpec.reducer
})

const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(...middlewares),
))

const elementById = document.getElementById('root') as Element
if (elementById) {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    elementById
  )
}

const initialRaml = `#%RAML 1.0
title: Sample API
version: 0.1
# this a comment!!
mediaType: application/json
baseUri: http://example.com/example

/ping:
  description: creates a new project
  get:
    description: to check if service is up. Returns basic information about deployed version
    responses:
      200:
        body: 
          application/json:
            type: number
            required: true
            example: 1000

/status:
  get:
    description: to check if service is up
    responses:
      200:
        body: 
          example: {"name": "Joe"}
`
store.dispatch(parseRaml(initialRaml))

registerServiceWorker();
