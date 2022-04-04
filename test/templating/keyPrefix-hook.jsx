import React from 'react'
import { useTranslation, Trans } from 'react-i18next'

// This will have test-namespace even though it comes before useTranslation during parsing
const Component = () => {
  return <Trans i18nKey="foo"></Trans>
}

function TestComponent() {
  const { t } = useTranslation('key-prefix', { keyPrefix: 'test-prefix' })
  return (
    <>
      <Component />
      <h1>{t('bar')}</h1>
    </>
  )
}

export default TestComponent
