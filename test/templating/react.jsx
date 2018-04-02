import React from 'react'
import { translate, Trans, Interpolate } from 'react-i18next'

const bar = () => (
  <div>
    <span><Trans i18nKey="bar"></Trans></span>
  </div>
);

const foo = () => (
  <div>
    <span><Trans i18nKey="foo" /></span>
  </div>
);

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
        <span><Trans i18nKey="fifth" count={count} /></span>
      </div>
    )
  }
}

export default translate('react')(Test)
