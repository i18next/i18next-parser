import React from 'react'
import { translate } from 'react-i18next'

class Test extends React.Component {
  render () {
    const { t } = this.props
    return (
      <div>
        <h1>{t('first')}</h1>
        <Interpolate i18nKey="second" value="some thing" component={interpolateComponent} />
        <Trans i18nKey="third.first" count={count}>
            Hello <strong title={t('fourth')}>{{name}}</strong>, you have {{count}} unread message. <Link to="/msgs">Go to messages</Link>.
        </Trans>
      </div>
    )
  }
}

export default translate('react')(Test)
