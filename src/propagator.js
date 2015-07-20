class Propagator {
  constructor () {
    this._targetOrigin = '*';
    window.addEventListener('message', this.onMessage.bind(this))
  }

  onMessage (e) {
    let payload = e.data;

    // if the message isn't an object, we can't propagate it.
    // everything coming from the channel is an object
    if (typeof e.data !== 'object') {
      return;
    }

    // if this is the first time the propagator has seen the message
    // then we initialize the receivedLocations
    if (payload.receivedLocations == null) {
      payload.receivedLocations = [window.location.href];
    }

    let hasntReceivedMessage = function (w) {
      return payload.receivedLocations.indexOf(w.location.href) === -1;
    };

    let propagators = [];
    let willReceiveMessage = function (w) {
      payload.receivedLocations.push(w.location.href);
      propagators.push(w);
    };

    // check downstream
    Array.prototype.forEach.call(document.querySelectorAll('iframe'), function (iframe) {
      if (hasntReceivedMessage(iframe.contentWindow)) {
        willReceiveMessage(iframe.contentWindow);
      }
    });

    // check upstream
    if (hasntReceivedMessage(window.parent)) {
      willReceiveMessage(window.parent);
    }

    //propagate
    propagators.forEach((p) => {
      p.postMessage(payload, this._targetOrigin);
    });
  }
}

export default {
  initialize () {
    if (!window.propagator) {
      window.propagator = new Propagator();
    }
  }
};