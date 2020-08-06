import React from 'react'
import { useTranslation, Trans } from 'react-i18next'

// This will have test-namespace even though it comes before useTranslation during parsing
const Component = () => {
  return <Trans i18nKey="test-1"></Trans>
}

function TestComponent() {
  const { t } = useTranslation('test-namespace')
  return (
    <>
      <Component />
      <h1>{t('test-2')}</h1>
    </>
  )
}

export default TestComponent
