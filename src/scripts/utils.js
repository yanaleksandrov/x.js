import { setClasses, setStyles } from './classes';

/**
 * Creates a debounced function that delays the invocation of the provided function using a specified wait time.
 *
 * @param {Function} func - The function to be debounced.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
export function debounce(func, wait) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => func.apply(this, args), wait);
  }
}

export function pulsate(func, wait, immediate) {
  immediate && func();

  return setInterval(func, wait);
}

export function saferEval(expression, dataContext, additionalHelperVariables = {}, noReturn = false) {
  expression = noReturn ? `with($data){${expression}}` : (
    isKebabCase(expression) ?
      `var result;with($data){result=$data['${expression}']};return result` :
      `var result;with($data){result=${expression}};return result`
    );

  return (new Function(['$data', ...Object.keys(additionalHelperVariables)], expression))(
    dataContext, ...Object.values(additionalHelperVariables)
  )
}

export function getAttributes(el) {
  const regexp = /^(x-|x.|@|:)/;
  return [...el.attributes].filter(({ name }) => regexp.test(name)).map(({ name, value }) => {
    const startsWith = name.match(regexp)[0];
    const root       = name.replace(startsWith, '');
    const parts      = root.split('.');
    return {
      name,
      directive: startsWith === 'x-' ? name : (startsWith === ':' ? 'x-bind' : ''),
      event: startsWith === '@' ? parts[0] : '',
      expression: value,
      prop: startsWith === 'x.' ? parts[0] : '',
      modifiers: startsWith === 'x.' ? parts.slice(1) : root.split('.').slice(1)
    }
  });
}

export function updateAttribute(el, name, value) {
  if (name === 'value') {
    if (el.type === 'radio') {
      el.checked = el.value === value
    } else if (el.type === 'checkbox') {
      el.checked = Array.isArray(value) ? value.some(val => val === el.value) : !!value
    } else if (el.tagName === 'SELECT') {
      updateSelect(el, value)
    } else {
      el.value = value
    }
  } else if (name === 'class') {
    bindClasses(el, value)
  } else if (name === 'style') {
    bindStyles(el, value)
  } else if (['disabled', 'readonly', 'required', 'checked', 'autofocus', 'autoplay', 'hidden'].includes(name)) {
    !!value ? el.setAttribute(name, '') : el.removeAttribute(name);
  } else {
    el.setAttribute(name, value)
  }
}

function bindClasses(el, value) {
  if (el._x_undoAddedClasses) {
    el._x_undoAddedClasses()
  }
  el._x_undoAddedClasses = setClasses(el, value)
}

function bindStyles(el, value) {
  if (el._x_undoAddedStyles) {
    el._x_undoAddedStyles()
  }
  el._x_undoAddedStyles = setStyles(el, value)
}

export function updateSelect(el, value) {
  const arrayWrappedValue = [].concat(value).map(value => value + '')

  Array.from(el.options).forEach(option => {
    option.selected = arrayWrappedValue.includes(option.value || option.text)
  })
}

export function eventCreate(eventName, detail = {}) {
  return new CustomEvent(eventName, {
    detail,
    bubbles: true,
    // Allows events to pass the shadow DOM barrier.
    composed: true,
    cancelable: true,
  })
}

export function getNextModifier(modifiers, modifierAfter, defaultValue = '') {
  return modifiers[modifiers.indexOf(modifierAfter) + 1] || defaultValue;
}

/**
 * Checks that the html element is the form input elements
 *
 * @param el
 * @returns {boolean}
 */
export function isInputField(el) {
  return ['input', 'select', 'textarea'].includes(el.tagName.toLowerCase());
}

/**
 * Check that string is in kebabcase format
 *
 * @param str
 * @returns {boolean}
 */
export function isKebabCase(str) {
  return /^[a-z][a-z\d]*(-[a-z\d]+)+$/.test(str);
}

export function isEmpty(variable) {
  return variable === '' || variable === null || (Array.isArray(variable) && variable.length === 0) || (typeof variable === 'object' && Object.keys(variable).length === 0);
}
