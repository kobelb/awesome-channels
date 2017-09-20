# Installation

```
npm install awesome-channels
```

import/require the library

```javascript
import { Channel } from 'awesome-channels';
```

or

```javascript
var Channel = require('awesome-channels').Channel;
```


# Usage
Channels work within a namespace. All publishers/consumers that wish to communicate should be using the same namespace. 

The recommended namespacing is 'project-name:page-name:sub-page-name' ommitting the sub-page-name if not appropriate. For example 'web-application:users:sign-up'.

```javascript
var channel = new Channel('web-application:users:sign-up');
```


To notify consumers that an event occurred we use the 'emit' method on the instance of the channel

```javascript
channel.emit('done', {studentId: 1});
```


to be alerted that an event occurred we use subscribe to the event using the 'on' method


```javascript
channel.on('done', function (payload) {
   console.log(payload);
   // in this example the console would print '{studentId: 1}'
});
```
