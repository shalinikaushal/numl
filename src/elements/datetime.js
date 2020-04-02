import NuFormatter from './formatter';
import { devMode, warn } from '../helpers';

const FULL = 'full';
const LONG = 'long';
const MEDIUM = 'medium';
const SHORT = 'short';
const NARROW = 'narrow';
const TWO_DIGIT = '2-digit';
const NUMERIC = 'numeric';
const AUTO = 'auto';

export const WEEKDAY_OPTIONS = [LONG, SHORT, NARROW];
export const ERA_OPTIONS = [LONG, SHORT, NARROW];
export const YEAR_OPTIONS = [NUMERIC, TWO_DIGIT];
export const MONTH_OPTIONS = [NUMERIC, TWO_DIGIT, LONG, SHORT, NARROW];
export const DAY_OPTIONS = [NUMERIC, TWO_DIGIT];
export const HOUR_OPTIONS = [NUMERIC, TWO_DIGIT];
export const MINUTE_OPTIONS = [NUMERIC, TWO_DIGIT];
export const SECOND_OPTIONS = [NUMERIC, TWO_DIGIT];
export const TIMEZONE_OPTIONS = [LONG, SHORT];
export const DAY_PERIOD_OPTIONS = [NARROW, SHORT, LONG];
export const DATE_STYLE_OPTIONS = [FULL, LONG, MEDIUM, SHORT];
export const TIME_STYLE_OPTIONS = [FULL, LONG, MEDIUM, SHORT];
export const HOUR_CYCLE_OPTIONS = ['h11', 'h12', 'h23', 'h24', AUTO];
export const CALENDAR_OPTIONS = [
  'buddhist', 'chinese', 'coptic', 'ethiopia', 'ethiopic', 'gregory', 'hebrew', 'indian',
  'islamic', 'iso8601', 'japanese', 'persian', 'roc'
];
export const SYSTEM_OPTIONS = [
  'arab', 'arabext', 'bali', 'beng', 'deva', 'fullwide', 'gujr',
  'guru', 'hanidec', 'khmr', ' knda', 'laoo', 'latn', 'limb',
  'mlym', 'mong', 'mymr', 'orya', 'tamldec', ' telu', 'thai', 'tibt',
];

const ALIAS_MAP = {
  a: (date, locale) => {
    return (new Intl.DateTimeFormat(locale, { hour: NUMERIC })
      .format(date)
      .split(' ')[1] || '')
      .toLowerCase();
  },
  ss: (date, locale) => {
    return new Intl.DateTimeFormat(locale, { minute: TWO_DIGIT, second: TWO_DIGIT })
      .format(date)
      .split(':')[1]
      .toLowerCase();
  },
  s: { second: NUMERIC },
  mm: (date, locale) => {
    return new Intl.DateTimeFormat(locale, { hour: TWO_DIGIT, minute: TWO_DIGIT })
      .format(date)
      .split(':')[1].split(' ')[0]
      .toLowerCase();
  },
  m: { minute: NUMERIC },
  hh: (date, locale) => {
    return new Intl.DateTimeFormat(locale, { hour: TWO_DIGIT })
      .format(date)
      .split(/\s/)[0]
      .toLowerCase();
  },
  h: (date, locale) => {
    return new Intl.DateTimeFormat(locale, { hour: NUMERIC })
      .format(date)
      .split(/\s/)[0]
      .toLowerCase();
  },
  DD: { day: TWO_DIGIT},
  D: { day: NUMERIC },
  dddd: { weekday: LONG},
  ddd: { weekday: SHORT},
  dd: { weekday: NARROW},
  MMMM: { month: LONG},
  MMM: { month: SHORT},
  MM: { month: TWO_DIGIT},
  M: { month: NUMERIC},
  YYYY: { year: NUMERIC },
  YY: { year: TWO_DIGIT },
};

const OPTIONS_MAP = {
  weekday: [WEEKDAY_OPTIONS, SHORT],
  era: [ERA_OPTIONS, SHORT],
  year: [YEAR_OPTIONS, NUMERIC],
  month: [MONTH_OPTIONS, LONG],
  day: [DAY_OPTIONS, NUMERIC],
  hour: [HOUR_OPTIONS, TWO_DIGIT],
  minute: [MINUTE_OPTIONS, TWO_DIGIT],
  second: [SECOND_OPTIONS, TWO_DIGIT],
  dayperiod: [DAY_PERIOD_OPTIONS, SHORT, 'dayPeriod'],
  calendar: [CALENDAR_OPTIONS],
  system: [SYSTEM_OPTIONS],
  date: [DATE_STYLE_OPTIONS, MEDIUM, 'dateStyle'],
  time: [TIME_STYLE_OPTIONS, MEDIUM, 'timeStyle'],
  zone: [TIMEZONE_OPTIONS, null, 'timeZoneName'],
  hourcycle: [HOUR_CYCLE_OPTIONS, AUTO, 'hourCycle'],
};

export default class NuDateTime extends NuFormatter {
  static get nuTag() {
    return 'nu-datetime';
  }

  static get nuAttrs() {
    return {
      value: '',
      locale: '',
      date: '',
      time: '',
      weekday: '',
      era: '',
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: '',
      second: '',
      zone: '',
      timezone: '',
      dayperiod: '',
      calendar: '',
      system: '',
      hourcycle: '',
      fallback: '',
      format: '',
    };
  }

  static nuFormat(value, locale, data) {
    const fallback = data.fallback != null ? data.fallback : (devMode ? 'Invalid' : '–');

    if (!(value instanceof Date)) {
      if (value === 'now') {
        value = new Date;
      } else if (value != null) {
        value = new Date(value);
      } else {
        return fallback;
      }
    }

    const timestamp = value.getTime();

    if (timestamp !== timestamp) return fallback;

    if (data.format) {
      let format = data.format;

      format = format.replace(/\w+/ig, (s) => {
        const opts = ALIAS_MAP[s];

        if (!opts) return s;

        if (typeof opts === 'function') {
          return opts(value, locale);
        }

        return this.nuFormat(value, locale, opts);
      });

      return format.trim();
    }

    const options = Object.entries(OPTIONS_MAP)
      .reduce((opts, [key, map]) => {
        const optKey = map[2] || key;
        const defaultValue = map[1];
        const val = data[key];

        map = map[0];

        if (val === '' && defaultValue) {
          opts[optKey] = defaultValue;
        } else if (val) {
          if (map.includes(val)) {
            opts[optKey] = val;
          } else if (devMode) {
            warn(`NuDate: wrong value for "${key}":`, JSON.stringify(val));
          }
        }

        return opts;
      }, {});

    if (data.timezone) {
      options.timeZone = data.timezone;
    }

    if (data.hourcycle && data.hourcycle !== AUTO) {
      options.hourCycle = data.hourcycle;
    }

    const formatter = new Intl.DateTimeFormat(locale, options);

    try {
      return formatter.format(value);
    } catch (e) {
      warn('number format error', e);

      return fallback;
    }
  }

  nuApply() {
    super.nuApply();

    clearInterval(this.nuIntervalId);

    const value = this.getAttribute('value');

    if (value === 'now') {
      this.nuIntervalId = setInterval(() => {
        this.nuApply();
      }, 1000);
    }
  }
}
