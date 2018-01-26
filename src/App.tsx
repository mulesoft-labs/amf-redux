import * as React from 'react';
import './App.css';
import {connect} from 'react-redux'
import {Dispatch, ReduxState} from './types'
import * as apiSpec from './api-spec-redux'
import {Field} from './api-spec-redux'

const logo = require('./logo.svg');

export type ValueProps = {
  title: string
  version: string
  baseUri: string
}

export type EventProps = {
  onFieldChange: (field: Field, value: string) => void
}

export type Props = ValueProps & EventProps

class App extends React.PureComponent<Props, never> {

  handleTitleChangeRef = this.handleFieldChange.bind(this, apiSpec.TitleField)
  handleVersionChangeRef = this.handleFieldChange.bind(this, apiSpec.VersionField)
  handleBaseUriChangeRef = this.handleFieldChange.bind(this, apiSpec.BaseUriField)
  handleFieldChange(field: Field, e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onFieldChange(field, e.target.value)
  }

  render() {
    const {title, version, baseUri} = this.props

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <label htmlFor="title">
            Title
            <input id="title" type="text" value={title} onChange={this.handleTitleChangeRef}/>
          </label>
          <label htmlFor="version">
            Version
            <input id="version" type="text" value={version} onChange={this.handleVersionChangeRef}/>
          </label>
          <label htmlFor="baseUri">
            Base URI
            <input id="baseUri" type="text" value={baseUri} onChange={this.handleBaseUriChangeRef}/>
          </label>
        </p>
      </div>
    );
  }
}

export default connect(
  (state: ReduxState): ValueProps => ({
    title: state.apiSpec.title,
    version: state.apiSpec.version,
    baseUri: state.apiSpec.baseUri
  }),
  (dispatch: Dispatch): EventProps => ({
    onFieldChange: (field, value) => dispatch(apiSpec.updateField(field, value))
  })
)(App);
