
onmessage = function(e) {
  console.log('worker接收到消息', e.data)
}
console.log('worker加载完成')