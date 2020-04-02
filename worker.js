var pool = {};
var _timer = {};
var success = 'success';
onconnect = function (e) {
  var port = e.ports[0];
  port.addEventListener('message', function (e) {
    var actionType = e.data.actionType;
    var params = e.data.params;
    var key = params.key; 
    if (actionType === 'ActivePoll') {
      cancelTimer(key)
      pool[key] = 'pending';
      addTimer(key);
    } else if (actionType === 'CancelPoll') {
      cancelTimer(key);
    } else if (actionType === 'SuccessCall') {
      if (pool[key]) {
        pool[key] = success;
      }
    } else if (actionType === 'CancelDefine') {
      cancelTimer(key);
      delete pool[key];
    }
  });

  function addTimer(key) {
    _timer[key] = setInterval(function () {
      port.postMessage({ actionType: 'PollResponse', state: pool[key], poolKey:key });
    }, 1000)
  };

  function cancelTimer(key) {
    clearInterval(_timer[key]);
  };

  port.start();
}
