
function MessageNotify() {
  this.types = {};
  this.update('init');
};
MessageNotify.prototype.defineMessageType = function (CallName, CallBack) {
  this.types[CallName] = CallBack;
  if (window.$$Worker) {
    window.$$Worker.port.postMessage({
      actionType: 'ActivePoll',
      params: {
        key: CallName
      }
    });
  }
};
MessageNotify.prototype.cancelDefine = function (key) {
  window.$$Worker.port.postMessage({
    actionType: 'CancelDefine',
    params: {
      key: key
    }
  });
};
MessageNotify.prototype.update = function (type) {
  if (window.$$Worker) {
    window.$$Worker.port.postMessage({
      actionType: 'SuccessCall',
      params: {
        key: type
      }
    });
  } else {
    localStorage.setItem('notify', type);
  }
};
MessageNotify.prototype.onMessage = function (r) {
  console.log(r)
  var type = r.actionType; // 动作类型
  if (type === 'PollResponse') {
    if (r.state === 'success') {
      window.$$Worker.port.postMessage({
        actionType: 'CancelPoll',
        params: {
          key: r.poolKey
        }
      });
      this.types[r.poolKey] && this.types[r.poolKey]();
    }
  }
};

!function (MessageNotify) {
  window.$$MessageNotify = MessageNotify;
  if (window.SharedWorker) {
    window.$$Worker = new SharedWorker('./worker.js');
    window.$$Worker.onerror = function (e) {
      console.log([
        'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
      ].join(''));
    };
    window.$$Worker.port.start();
    window.$$Worker.port.onmessage = function (event) {
      console.log(event);
      MessageNotify.onMessage(event.data);
    };
  } else {
    window.addEventListener('storage', function (e) {
      if (e.newValue) {
        MessageNotify.onMessage(e.newValue);
      } else {
        console.debug('storage event info', e);
        if (e.storageArea) {
          var notify = Object.keys(e.storageArea).filter(key => key === 'notify');
          if (notify.length > 0) {
            MessageNotify.onMessage(e.storageArea.notify[0]);
          }
        }
      }
    })
  }
}(new MessageNotify());

