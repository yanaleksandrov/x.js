import Component from './component'
import { domReady } from './dom'

export const x = {
  directives: {},
  methods: {},

  start: async function () {
    await domReady()

    this.discoverComponents(el => this.initializeElement(el))
    this.listenUninitializedComponentsAtRunTime(el => this.initializeElement(el))
  },

  discoverComponents: callback => {
    Array.from(document.querySelectorAll('[x-data]')).forEach(callback)
  },

  listenUninitializedComponentsAtRunTime: callback => {
    let observer = new MutationObserver(mutations =>
      mutations.forEach(mutation =>
        Array.from(mutation.addedNodes)
          .filter(node => node.nodeType === 1 && node.matches('[x-data]'))
          .forEach(callback)
      )
    );

    observer.observe(
      document.querySelector('body'),
      {
        childList: true,
        attributes: true,
        subtree: true,
      }
    )
  },

  initializeElement: el => {
    el.__x = new Component(el)
  }
}
