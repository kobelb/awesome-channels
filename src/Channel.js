import uuid from 'uuid';

class Channel {

  _dispatchMessage (message) {
    Array.prototype.forEach.call(this._subscribers, function (cb) {
      cb(message);
    });
  }

  _getIframes () {
    return document.querySelectorAll('iframe')
  }

  _onMessage (e) {
    let payload = e.data;

    // we only want to process the message once, including propagating it to all of our parents and children
    if (payload.receivedIds.indexOf(this._id) >= 0) {
      return;
    }

    payload.receivedIds.push(this._id);
    this._dispatchMessage(payload.message);
    this._propagateMessage(payload);
  }

  _propagateMessage (message) {
    Array.prototype.forEach.call(this._getIframes(), (iframe) => {
      iframe.contentWindow.postMessage(message, this._targetOrigin);
    });

    if (window.parent) {
      window.parent.postMessage(message, this._targetOrigin);
    }
  }

  constructor () {
    this._id = uuid.v1();
    this._targetOrigin = '*';
    this._subscribers = [];
    window.addEventListener('message', this._onMessage.bind(this));
  }

  trigger (message) {
    let payload = {
      message,
      receivedIds: [this._id]
    };

    Array.prototype.forEach.call(this._getIframes(), (iframe) => {
      iframe.contentWindow.postMessage(payload, this._targetOrigin);
    });

    if (window.parent) {
      window.parent.postMessage(payload, this._targetOrigin);
    }
  }

  on (cb) {
    this._subscribers.push(cb);
  }

}

export default Channel;