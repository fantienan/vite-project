const timeout = 1000
function Enqueue() {
  this.taskList = []; // 任务队列，每个对象代表一个待运行的任务。
  this.totalTaskCount = 0; // 是一个已被添加到队列的任务数量计数器，只会增大，不会减小。我们用它计算总工作量进度的百分比值
  this.currentTaskNumber = 0; // 用于追踪到现在为止已处理了多少任务。
  this.taskHandle = null; // 是对当前处理中任务的一个引用。
  this.statusRefreshScheduled = false; // 用它来追踪我们是否已经为即将到来的帧安排了状态显示框的更新，所以我们每一帧只执行一次。
}

Enqueue.prototype.enqueueTask = function(taskHandler, taskData, done) {
  this.taskList.push({
    handler: taskHandler,
    data: taskData
  });

  this.totalTaskCount++;

  if (!this.taskHandle) {
    this.taskHandle = requestIdleCallback((deadline) => this.runTaskQueue(deadline, done), { timeout: timeout });
  }
}

Enqueue.prototype.runTaskQueue= function(deadline, done) {
  console.log(deadline.timeRemaining(), deadline.didTimeout)
  while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && this.taskList.length) {
    let task = this.taskList.shift();
    this.currentTaskNumber++;
    task.handler(task.data);
    // this.scheduleStatusRefresh();
  }

  if (this.taskList.length) {
    this.taskHandle = requestIdleCallback((d) => this.runTaskQueue(d, done), { timeout: timeout} );
  } else {
    console.log(this.currentTaskNumber)
    this.taskHandle = 0;
    done()
  }
}

Enqueue.prototype.cancel = function() {
  // if (!this.taskList.length) return;
  this.taskList = [];
  this.taskHandle = 0;
  console.log(`取消任务，${this.taskList.length}个任务未执行`)
}

window.Enqueue = Enqueue;