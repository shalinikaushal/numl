const schemeWidget = Nude.getElementById("prefers-color-scheme");
const contrastWidget = Nude.getElementById("prefers-contrast");
const schemeClass = 'nu-prefers-color-scheme';
const schemeValues = ['auto', 'dark', 'light'];
const contrastClass = 'nu-prefers-contrast';
const contrastValues = ['auto', 'high', 'low'];
const reduceMotionClass = 'nu-prefers-reduced-motion';
const images = require('./images/*.svg');

function getClassName(base, value) {
  if (value === 'auto') {
    return base;
  } else {
    return `${base}-${value}`;
  }
}

function reduceMotion() {
  htmlEl.classList.add(reduceMotionClass);
}

function restoreMotion() {
  htmlEl.classList.remove(reduceMotionClass);
}

const htmlEl = document.querySelector('html');

htmlEl.classList.add(schemeClass, contrastClass);

schemeWidget.addEventListener('input', function (evt) {
  const value = evt.detail;

  reduceMotion();

  setTimeout(() => {
    schemeValues.forEach(val => {
      htmlEl.classList.remove(getClassName(schemeClass, val));
    });

    const className = getClassName(schemeClass, value);

    htmlEl.classList.add(className);

    setTimeout(() => {
      restoreMotion();
    }, 3000);
  }, 0);
});

contrastWidget.addEventListener('input', function (evt) {
  const value = evt.detail;

  contrastValues.forEach(val => {
    htmlEl.classList.remove(getClassName(contrastClass, val));
  });

  const className = getClassName(contrastClass, value);

  htmlEl.classList.add(className);
});

setTimeout(() => {
  const bytesEl = Nude.getElementById('bytes');
  bytesEl.innerText = [...document.querySelectorAll('style')].reduce((sum, el) => sum += el.textContent.length, 0) * 2;
}, 1000);

Nude.elements.NuSvg.nuLoader = (name) => {
  const url = images[name];

  if (!url) throw 'image not found';

  return fetch(url)
    .then(response => response.text());
};

Nude.getElementById('logo').setAttribute('name', 'logo');