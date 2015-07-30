import uuid from 'uuid';

export default function (callback) {
  const maxLength = 100

  let messageIds = [];

  return function (e) {
    // if the message isn't an object, we can't do anything because we have to track this
    // message to see if we've seen it before
    if (typeof e.data !== 'object') {
      return;
    }

    if (!e.data.id) {
      e.data.id = uuid.v4();
    }

    if (messageIds.indexOf(e.data.id) > -1) {
      return;
    }

    // only keeping track of a certain number of messages so we don't use up all the memory
    messageIds.unshift(e.data.id);
    if (messageIds.length > maxLength) {
      messageIds.pop();
    }

    callback(e);
  }
}