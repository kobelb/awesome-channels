import processMessageOnce from './processMessageOnce';

class Propagator {
  constructor () {
    this._targetOrigin = '*';
    window.addEventListener('message', processMessageOnce(this.onMessage.bind(this)));
  }

  onMessage (e) {
    let payload = e.data;

    // if the message isn't an object, we can't propagate it.
    // everything coming from the channel is an object
    if (typeof e.data !== 'object') {
      return;
    }

    let propagators = [];

    // check downstream
    Array.prototype.forEach.call(document.querySelectorAll('iframe'), function (iframe) {
      propagators.push(iframe.contentWindow);
    });

    // check upstream
    if (window.parent) {
      propagators.push(window.parent);
    }

    //propagate
    propagators.forEach((p) => {
      p.postMessage(payload, this._targetOrigin);
    });
  }
}

export default {
  initialize () {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.propagator) {
      window.propagator = new Propagator();
    }
  }
};