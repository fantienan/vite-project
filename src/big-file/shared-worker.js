let sharedData = {}; // 共享状态

// 监听来自客户端的连接事件
onconnect = function(event) {
  const port = event.ports[0]; // 获取连接的消息通道
  // 监听来自客户端的消息
  port.onmessage = function(event) {
    const data = event.data;
    port.postMessage(sharedData);
  }

  // 向客户端发送初始化消息
  port.postMessage({ type: 'init' });
};