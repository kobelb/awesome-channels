import propagator from './propagator';
propagator.initialize();

class Channel {

  _dispatchMessage (message) {
    Array.prototype.forEach.call(this._subscribers, function (cb) {
      cb(message);
    });
  }

  _onMessage (e) {
    let payload = e.data;

    if (payload.namespace !== this._namespace)
      return;

    this._dispatchMessage(payload.message);
  }

  constructor (namespace) {
    this._namespace = namespace;
    this._targetOrigin = '*';
    this._subscribers = [];
    window.addEventListener('message', this._onMessage.bind(this));
  }

  trigger (message) {
    let payload = {
      namespace: this._namespace,
      message
    };

    window.postMessage(payload, this._targetOrigin);
  }

  on (cb) {
    this._subscribers.push(cb);
  }

}

export default Channel;