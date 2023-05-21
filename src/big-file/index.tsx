import React, { useEffect, useRef, useState } from 'react'
import {Modal, message} from 'antd'
import * as tus from 'tus-js-client'
import JSZip from '@cantoo/jszip'
// import JSZip from 'jszip'
// import type {JSZipObject} from 'jszip'

// const sharedWorker = new SharedWorker('../../src/big-file/shared-worker.js');
// const worker = new Worker('../../src/big-file/worker.js');
/** 读取 shape zip 压缩文件内容 */
export const readShapeZip = async (zipFile: File) => {
  const zipContent = await JSZip.loadAsync(zipFile).catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
};

export const BigFile = () => {
    const uploadInstance = useRef<tus.Upload>()
    const [state, dispatch] = useState<any>({
      uploadedBytes: 0,
      totalBytes: 0,
      file: null,
      status: '没有选择文件',
      uploadUrl: null,
      filePath: null
    })

  const setState = (newState: any) => {
      dispatch((v: any) => ({ ...v, ...newState }))
  }

  const startUploadByWorker =() => {
    const { file } = state
    if (!file) return
    // worker.postMessage({type: 'start', file});
  }

  const getExtension = (filename: string) => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    } else {
      return filename.slice(lastDotIndex + 1);
    }
  }

  const verify = (file?: File): Promise<{success: boolean, msg?: string}> => {
    return new Promise(async (resolve, reject) => {
      if (!file) {
        resolve({success: false, msg: '请选择文件'})
        return
      }
      const fileTypes = ['.zdb', '.gdb', '.shp'];

      let msg = ''
      const res = await JSZip.loadAsync(file).catch((err) => {
        console.log(err)
      })
      if (res && res.files) {

      console.log(res)
        const arr =  Object.keys(res.files);
        if (arr.length !== 1) {
          msg = `压缩包中存在多个文件，只允许上传${fileTypes.join('、')}中的一个文件`
        } else if (arr[0].includes('/')) {
          msg = '压缩包中不能存在目录'
        } else if (!fileTypes.includes(getExtension(arr[0]))) {
          msg = `压缩包中的文件类型不正确，请上传${fileTypes.join('、')}中的一个文件`
        }
      } else {
        msg = '文件解析失败，请整理文件重新上传'
      }
      if (msg) {
        resolve({success: false, msg})
      }
    })
  }

  const  startUpload = async () => {
    const { file } = state
    // const verifyResult = await verify(file);
    // if (!verifyResult.success) {
    //   message.error(verifyResult.msg)
    //   return
    // }
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

    uploadInstance.current = upload;
    let previousUploads = await upload.findPreviousUploads()
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
      previousUploads = previousUploads
        .map((upload) => {
          upload.creationTime = new Date(upload.creationTime).getTime() as any
          return upload
        })
        .filter((upload) => +upload.creationTime > threeHoursAgo)
        .sort((a, b) => +b.creationTime - +a.creationTime)
    if (previousUploads.length) {
      Modal.confirm({
        title: '检测到上次上传未完成，是否继续上传？',
        onOk: () => {
          upload.resumeFromPreviousUpload(previousUploads[0])
          upload.start()
          setState({
            status: '开始上传',
            uploadedBytes: 0,
            totalBytes: 0,
            uploadUrl: null,
          })
        },
        onCancel: () => {
          upload.start()
          setState({
            status: '开始上传',
            uploadedBytes: 0,
            totalBytes: 0,
            uploadUrl: null,
          })
        }

      })
    } else {

      upload.start()
    
      setState({
        status: '开始上传',
        uploadedBytes: 0,
        totalBytes: 0,
        uploadUrl: null,
      })
    }

  }

  const onChange = async (value:any) => {
    setState({file: value.target.files[0], filePath: value.target.value})
  //   const file = value.target.files[0]
  //   const reader = new FileReader();
  //   reader.onload = function(event) {
  //     const arrayBuffer = event.target.result;

  //     JSZip.loadAsync(arrayBuffer).then(function(zip) {
  //       const files = zip.file(/.*/);
  //       for (const file of files) {
  //         file.async('text').then(function(content) {
  //           console.log(file.name, content);
  //         });
  //       }
  //     });
  //   };
  // reader.readAsArrayBuffer(file);
  }

  const fetchBaiDu = () => {
    for(let i = 0; i < 10; i++) {
      fetch('/csldtfile/test');
    }
  }

  const go = () => {
    uploadInstance.current?.start()
  }
  const pause = () => {
    uploadInstance.current?.abort()
  }

  const cancel = () => {
    if (uploadInstance.current) {
      uploadInstance.current?.abort(true);
      
    }
  }

  useEffect(() => {
    window.addEventListener("unload", (event) => {
      alert('页面关闭')
      uploadInstance.current?.abort(true);
    })
    // worker.onmessage = function(event) {
    //   const data = event.data;
    //   if (data.type === 'progress') {
    //     setState(data.state)
    //   }
    // };
    // worker.postMessage('Hello World');
  }, [])

  return <div>
    <input type="file" onChange={onChange}/>
      <div>
          {state.uploadedBytes} of {state.totalBytes}
      </div>
    <div>
      {state.status}
    </div>
      <button onClick={startUpload} >
        开始上传
      </button>
      <button onClick={pause}>暂停</button>
      <button onClick={go}>继续</button>
      <button onClick={cancel}>取消</button>
      <button onClick={startUploadByWorker} >
        webWorker中开始上传
      </button>
      <button onClick={fetchBaiDu}>并发请求测试</button>
  </div>
}