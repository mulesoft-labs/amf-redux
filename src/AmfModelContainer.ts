import * as amf from 'amf-client-js'

amf.plugins.document.WebApi.register()
amf.plugins.document.Vocabularies.register()
amf.plugins.features.AMFValidation.register()

class AmfModelContainer {
  model: amf.model.document.Document | null = null
  parser: Promise<amf.core.client.Parser>

  constructor() {
    this.parser = amf.Core.init()
      .then(() =>  amf.AMF.raml10Parser())
  }

  setModel(model: amf.model.document.Document) {
    this.model = model
  }

}

export default AmfModelContainer