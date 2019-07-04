import './icon.css';
import {
  convertUnit,
} from '../helpers';
import Nude from '../nude';
import {
  GRID_ITEM_ATTRS,
} from '../helpers';
import NuComponent from './component';

const iconAttrsList = [
  ...GRID_ITEM_ATTRS,
];

export default class NuIcon extends NuComponent {
  static get nuTag() {
    return 'icon';
  }

  static get nuAttrs() {
    return NuComponent.nuAttrs.concat(iconAttrsList, ['size', 'name', 'inline']);
  }

  nuChanged(name, oldValue, value) {
    super.nuChanged(name, oldValue, value);

    switch (name) {
      case 'name':
        Nude.iconLoader(value).then(svg => this.innerHTML = svg);
        break;
      case 'size':
        this.style['width'] = convertUnit(value || '');
        this.style['height'] = convertUnit(value || '');
        break;
      case 'inline':
        this.style['margin-top'] = value != null ? '-0.125rem' : '';
    }
  }
}
