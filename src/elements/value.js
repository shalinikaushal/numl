import NuEl from './el';

export default class NuValue extends NuEl {
  static get nuTag() {
    return 'nu-value';
  }

  static get nuBehaviors() {
    return {
      value: true,
    };
  }

  static get nuStyles() {
    return {
      color: ':placeholder[var(--placeholder-color, rgba(var(--text-color-rgb), var(--disabled-opacity)))] inherit',
    };
  }
}
