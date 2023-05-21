importScripts('../../src/big-file/tus.js')

const startUpload = async (file, setState = () => {}) => {
    if (!file) return
    const upload = new tus.Upload(file, {
      // endpoint: 'https://tusd.tusdemo.net/files/',
      endpoint: '/csldt/ldt-service/file/upload',
      retryDelays: [0, 1000, 3000, 5000],
      parallelUploads: 10,
      headers: {
        'parallel-uploads': '10', 
      },
      metadata: {
        name: file.name,
      },
      onError: (error) => {
        setState({ status: `上传失败${error}` })
      },
      onProgress: (uploadedBytes, totalBytes) => {
        setState({ totalBytes, uploadedBytes, })
      },
      onSuccess: () => {
        setState({ status: '上传完成', uploadUrl: upload.url, })
        console.log('Upload URL:', upload.url)
      },
    })

    let previousUploads = await upload.findPreviousUploads()
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
    previousUploads = previousUploads
        .map((upload) => {
          upload.creationTime = new Date(upload.creationTime).getTime();
          return upload
        })
        .filter((upload) => +upload.creationTime > threeHoursAgo)
        .sort((a, b) => +b.creationTime - +a.creationTime)

    // If no upload was previously started, we can directly start the upload.
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0])
    }

    upload.start()
  
    setState({ status: '开始上传', uploadedBytes: 0, totalBytes: 0, uploadUrl: null, })
  }
onmessage = function(e) {
  if (e.data.type === 'start') {
    startUpload(e.data.file, (state) => {
      postMessage({type: 'progress', state});
    })
  }
  console.log('worker接收到消息', e.data)
}