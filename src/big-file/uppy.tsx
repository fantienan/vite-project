// import React, { useEffect, useState } from'react'
// import Uppy from'@uppy/core'
// import Tus from'@uppy/tus'
// import GoogleDrive from'@uppy/google-drive'
// import { Dashboard, DashboardModal, DragDrop, ProgressBar, FileInput } from'@uppy/react'

// import '@uppy/core/dist/style.css'
// import '@uppy/dashboard/dist/style.css'
// import '@uppy/drag-drop/dist/style.css'
// import '@uppy/file-input/dist/style.css'
// import '@uppy/progress-bar/dist/style.css'

// export const UppyDemo =  () => {

//   const [state, dispatch] = useState({
//       showInlineDashboard: false,
//       open: false
//     })

//     const [uppy2] = useState(() => {
//     return new Uppy({ id: 'uppy2', autoProceed: false, debug: true })
//       .use(Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })
//     })

//     const setState = (newState: any) => {
//       dispatch((v: any) => ({ ...v, ...newState }))
//     }

//   useEffect(() => {
//     return () => {
//       uppy2.close({reason: 'unmount'});
//     }
//   }, [])

// const  handleModalClick = () =>{
//     setState({
//       open: !state.open
//     })
//   }

//     const { showInlineDashboard } = state
//     return (
//       <div>
//         <h1>React Examples</h1>

//         <h2>Inline Dashboard</h2>
//         <label>
//           <input
//             type="checkbox"
//             checked={showInlineDashboard}
//             onChange={(event) => {
//               setState({
//                 showInlineDashboard: event.target.checked
//               })
//             }}
//           />
//           Show Dashboard
//         </label>

//         <h2>Modal Dashboard</h2>
//         <div>
//           <button onClick={handleModalClick}>
//             {state.open ? 'Close dashboard' : 'Open dashboard'}
//           </button>
//           <DashboardModal
//             uppy={uppy2}
//             open={state.open}
//             target={document.body}
//             onRequestClose={() => setState({ open: false })}
//           />
//         </div>

//         <h2>Drag Drop Area</h2>
//         <DragDrop
//           uppy={uppy}
//           locale={{
//             strings: {
//               chooseFile: 'Boop a file',
//               orDragDrop: 'or yoink it here'
//             }
//           }}
//         />

//         <h2>Progress Bar</h2>
//         <ProgressBar
//           uppy={uppy}
//           hideAfterFinish={false}
//         />

//         <h2>File Input</h2>
//         <FileInput
//           uppy={uppy}
//         />
//       </div>
//     )
// }
export default () => null;