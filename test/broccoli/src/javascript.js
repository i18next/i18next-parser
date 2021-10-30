import bla from 'bla';

notRelated()
i18n.t('first')
i18n.t('second', 'defaultValue')
i18n.t('third', {
  defaultValue: '{{var}} defaultValue'
})
i18n.t(
    'fou' +
   'rt' +
   'h'
)
if (true) {
  i18n.t('not picked' + variable, {foo: bar}, 'bla' + 'asd', {}, foo+bar+baz )
}
i18n.t(variable, {foo: bar}, 'bla' + 'asd', {}, foo+bar+baz )
