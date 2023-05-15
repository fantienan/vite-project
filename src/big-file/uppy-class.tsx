/* eslint-disable */
// import React from'react'
// import Uppy from'@uppy/core'
// import Tus from'@uppy/tus'
// import GoogleDrive from'@uppy/google-drive'
// import { Dashboard, DashboardModal, DragDrop, ProgressBar, FileInput } from'@uppy/react'

// import '@uppy/core/dist/style.css'
// import '@uppy/dashboard/dist/style.css'
// import '@uppy/drag-drop/dist/style.css'
// import '@uppy/file-input/dist/style.css'
// import '@uppy/progress-bar/dist/style.css'

// export default class App extends React.Component {
//   constructor (props) {
//     super(props)

//     this.state = {
//       showInlineDashboard: false,
//       open: false
//     }

//     this.uppy = new Uppy({ id: 'uppy1', autoProceed: true, debug: true })
//       .use(Tus, { endpoint: 'https://tusd.tusdemo.net/files/', chunkSize: 5 * 1024 * 1024, parallelUploads: 10 })

//     this.handleModalClick = this.handleModalClick.bind(this)
//   }

//   componentWillUnmount () {
//     this.uppy.close({ reason: 'unmount' })
//   }

//   handleModalClick () {
//     this.setState({
//       open: !this.state.open
//     })
//   }

//   render () {
//     const { showInlineDashboard } = this.state
//     return (
//       <div>
//         <h1>React Examples</h1>

//         <h2>Inline Dashboard</h2>
//         <label>
//           <input
//             type="checkbox"
//             checked={showInlineDashboard}
//             onChange={(event) => {
//               this.setState({
//                 showInlineDashboard: event.target.checked
//               })
//             }}
//           />
//           Show Dashboard
//         </label>
//         {showInlineDashboard && (
//           <Dashboard
//             uppy={this.uppy}
//             metaFields={[
//               { id: 'name', name: 'Name', placeholder: 'File name' }
//             ]}
//           />
//         )}

//         <h2>Progress Bar</h2>
//         <ProgressBar
//           uppy={this.uppy}
//           hideAfterFinish={false}
//         />

//         <h2>File Input</h2>
//         <FileInput
//           uppy={this.uppy}
//         />
//       </div>
//     )
//   }
// }
export default () => null;