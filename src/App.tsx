// import { ConfigProvider, Button, DatePicker, Modal } from 'antd'
// import { StyleProvider } from '@ant-design/cssinjs';
// import zhCN from 'antd/locale/zh_CN'
// import 'dayjs/locale/zh-cn'
import { BigFile } from './big-file';
// import {Maptalks} from './maptalks'
// import UppyClass from './big-file/uppy-class'
// import OlDemo  from './ol'
import {WebGLPointsLayerExample} from './ol/webgl-points-layer'

function App() {
  const onClick = () => {
    // Modal.confirm({title: "confirm"})
  }
  return (
    <div className="App">
      {/* <OlDemo /> */}
      {/* <WebGLPointsLayerExample/> */}
      <BigFile />
      {/* <UppyClass/> */}
      {/* <Maptalks/> */}
      {/* <StyleProvider hashPriority="high">
        <ConfigProvider theme={{
          token: {
            colorPrimary: 'red'
          }
        }} locale={zhCN}>
          <Button type="primary" onClick={onClick}>按钮</Button>
          <DatePicker />
        </ConfigProvider>
      </StyleProvider> */}
    </div>
  )
}

export default App
