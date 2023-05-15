import React, { useState } from 'react'
import {v4 as uuidV4} from 'uuid'
import * as tus from 'tus-js-client'

export const BigFile = () => {
    const [state, dispatch] = useState<any>({
      uploadedBytes: 0,
      totalBytes: 0,
      file: null,
      status: 'no file selected',
      uploadUrl: null,
    })

    const setState = (newState: any) => {
        dispatch((v: any) => ({ ...v, ...newState }))
    }


  const getFileExtension = (uri:string) => {
    const match = /\.([a-zA-Z]+)$/.exec(uri)
    if (match !== null) {
      return match[1]
    }

    return ''
  }

const   getMimeType = (extension:string) =>  {
    if (extension === 'jpg') return 'image/jpeg'
    return `image/${extension}`
  }


const  startUpload = async () => {
    const { file } = state
    if (!file) return
    const extension = getFileExtension(file.name)
    const upload = new tus.Upload(file, {
      // endpoint: 'https://tusd.tusdemo.net/files/',
      endpoint: '/csldt/ldt-service/file/upload',
      retryDelays: [0, 1000, 3000, 5000],
      parallelUploads: 10,
      // chunkSize: 5 *1024 * 1024,
      metadata: {
        name: file.name,
        id: uuidV4() 
      },
      onError: (error) => {
        setState({ status: `upload failed ${error}` })
      },
      onProgress: (uploadedBytes, totalBytes) => {
        setState({ totalBytes, uploadedBytes, })
      },
      onSuccess: () => {
        setState({ status: 'upload finished', uploadUrl: upload.url, })
        console.log('Upload URL:', upload.url)
      },
    })

     let previousUploads = await upload.findPreviousUploads()
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
      previousUploads = previousUploads
        .map((upload) => {
          upload.creationTime = new Date(upload.creationTime).getTime() as any
          return upload
        })
        .filter((upload) => +upload.creationTime > threeHoursAgo)
        .sort((a, b) => +b.creationTime - +a.creationTime)

    // If no upload was previously started, we can directly start the upload.
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0])
    }

    upload.start()
  
    setState({
      status: 'upload started',
      uploadedBytes: 0,
      totalBytes: 0,
      uploadUrl: null,
    })
  }

  const onChange = (value:any) => {
    setState({file: value.target.files[0]})
  }

  return <div>
    <input type="file" onChange={onChange}/>
      <div>
          {state.uploadedBytes} of {state.totalBytes}
      </div>
    <div>
      {state.status}
    </div>
      <button onClick={startUpload} title="Start Upload" >
        Start uploading a file
      </button>
  </div>
}