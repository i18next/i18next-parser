import React from 'react'
import { useTranslation } from 'react-i18next'

function TestComponent() {
  const { t: tCommon } = useTranslation('common')
  const { t: tPrefix } = useTranslation('common', {keyPrefix: "random"})
  const { t } = useTranslation('test')
  return (
    <>
      <h1>{t('bar')}</h1>
      <h2>{tCommon('foo')}</h2>
      <h3>{tPrefix('stuff')}</h3>
    </>
  )
}

export default TestComponent
