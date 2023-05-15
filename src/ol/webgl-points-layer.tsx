import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Vector from 'ol/source/Vector';
import View from 'ol/View';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import { useEffect } from 'react';
import {predefinedStyles, txt2GeoJSON} from './utils'

import './ol.css'


export const WebGLPointsLayerExample = () => {
    useEffect(() => {

async function main() {

let literalStyle: any;
let pointsLayer: any;
const res = await txt2GeoJSON()

const vectorSource = new Vector({
  url: 'data/geojson/hu-lin-yuan.geojson',
  // url: 'data/geojson/world-cities.geojson',
  format: new GeoJSON(),
  wrapX: true,
});
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: document.getElementById('map')!,
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});


function refreshLayer(newStyle: any) {
  const previousLayer = pointsLayer;
  pointsLayer = new WebGLPointsLayer({
    source: vectorSource as any,
    style: newStyle,
  });
  map.addLayer(pointsLayer);

  if (previousLayer) {
    map.removeLayer(previousLayer);
    previousLayer.dispose();
  }
  literalStyle = newStyle;
}

const spanValid = document.getElementById('style-valid') as HTMLSpanElement;
const spanInvalid = document.getElementById('style-invalid') as HTMLSpanElement;
function setStyleStatus(errorMsg: string) {
  const isError = typeof errorMsg === 'string';
  spanValid.style.display = errorMsg === null ? 'initial' : 'none';
  if (spanInvalid.firstElementChild) {
    (spanInvalid.firstElementChild as HTMLSpanElement).innerText = isError ? errorMsg : '';
  }
  spanInvalid.style.display = isError ? 'initial' : 'none';
}

const editor = document.getElementById('style-editor')! as HTMLTextAreaElement;
editor.addEventListener('input', function () {
  const textStyle = editor.value;
  try {
    const newLiteralStyle = JSON.parse(textStyle);
    if (JSON.stringify(newLiteralStyle) !== JSON.stringify(literalStyle)) {
      refreshLayer(newLiteralStyle);
    }
    setStyleStatus('');
  } catch (e: any) {
    setStyleStatus(e.message);
  }
});

function onSelectChange() {
  const newLiteralStyle = predefinedStyles.circles;
  editor.value = JSON.stringify(newLiteralStyle, null, 2);
  try {
    refreshLayer(newLiteralStyle);
    setStyleStatus('');
  } catch (e) {
    setStyleStatus((e as any).message);
  }
}
onSelectChange();

// animate the map
// function animate() {
//   map.render();
//   window.requestAnimationFrame(animate);
// }
// animate();

}
main()

    }, [])
    return <div>
 <div id="map" className="map" style={{height: '80vh'}}></div>
    Choose a predefined style from the list below or edit it as JSON manually.
    <textarea style={{width: "100%", height: "20rem", fontFamily: "monospace", fontSize: "small"}} id="style-editor"></textarea>
    <small>
      <span id="style-valid" style={{display: "none", color: "forestgreen"}}>✓ style is valid</span>
      <span id="style-invalid" style={{display: "none", color: "grey"}}>✗ <span>style not yet valid...</span></span>
      &nbsp;
    </small>
    </div>
}