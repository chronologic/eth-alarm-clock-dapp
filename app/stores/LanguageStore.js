import intl from 'react-intl-universal';

const SUPPORTED_LOCALES = [
  {
    name: 'English',
    value: 'en-US',
    selectorValue: 'US'
  },
//   {
//     name: 'Portuguese',
//     value: 'pt-BR'
//   },
  {
    name: 'Spanish',
    value: 'es-ES',
    selectorValue: 'ES'
  }
];

export default class LanguageStore {
  currentLocale;
  selectorValue;

  constructor() {
    this.currentLocale = intl.determineLocale({
      urlLocaleKey: 'lang',
    });

    // Fall back to en-US if language can't be found or is undefined
    if (!SUPPORTED_LOCALES.find(a => a.value === this.currentLocale)) {
      this.currentLocale = 'en-US';
    }

    this.selectorValue = SUPPORTED_LOCALES.find(a => a.value === this.currentLocale).selectorValue;
  }

  /*
    Load locales
  */
  async loadLocales() {
    let response = await fetch(`/app/locales/${this.currentLocale}.json`);
    let data = await response.json();

    intl.init({
      currentLocale: this.currentLocale,
      locales: {
        [this.currentLocale]: data
      }
    });
  }

  /*
    Load a select locale by reloading the page
  */
  loadLocale(targetLocale) {
    let locale = SUPPORTED_LOCALES.find(a => a.selectorValue === targetLocale);
    if (locale) {
      location.search = `?lang=${locale.value}`;
    }
  }
}