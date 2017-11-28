import React from 'react'
import { translate } from 'react-i18next'

class Test extends React.Component {
  render () {
    const { t } = this.props
    return (
      <div>
        <h1>{t('hello_specific')}</h1>
        <p>{t('common:hello_common')}</p>
      </div>
    )
  }
}

export default translate('specific_namespace')(Test)
