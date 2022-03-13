export default class PluralRules {
  constructor(locale) {
    this.locale = locale
  }

  resolvedOptions() {
    let pluralCategories = ['one', 'other']

    if (this.locale === 'fr') {
      pluralCategories = ['one', 'many', 'other']
    }

    return {
      pluralCategories,
    }
  }
}
