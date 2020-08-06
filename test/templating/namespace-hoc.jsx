import React from 'react'
import { withTranslation, Trans } from 'react-i18next'

// This will have test-namespace even though it comes before withTranslation during parsing
const Component = () => {
  return <Trans i18nKey="test-1"></Trans>
}

function TestComponent({ t, i18n }) {
  return (
    <>
      <Component />
      <h1>{t('test-2')}</h1>
    </>
  )
}

export default withTranslation('test-namespace')(TestComponent)
