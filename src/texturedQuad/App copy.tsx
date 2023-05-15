import { useEffect, useRef } from 'react';
import veerJpg from './assets/veer.jpg';
import skyJpg from './assets/sky.jpg'
import {main} from './'


function App() {
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = imgRef.current
    if (img) {
      img.onload = function(e) {
        main(e.target as HTMLImageElement)
      }

    }
  }, [])
  return (
    <div className="App">
    <canvas id="webgl">
      Please use a browser that supports "canvas"
    </canvas>
      <img src={skyJpg} id="img" ref={imgRef} style={{transform: 'scale(0.1) rotateY(180deg)'}}/>
    </div>
  )
}

export default App
