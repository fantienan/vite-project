import MVT from 'ol/format/MVT.js';
import Layer from 'ol/layer/Layer.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import {asArray} from 'ol/color.js';
import {packColor} from 'ol/renderer/webgl/shaders.js';

class WebGLLayer extends Layer {
  createRenderer() {
    return new WebGLVectorLayerRenderer(this, {
      fill: {
        attributes: {
          color: function (feature) {
            const color = asArray(feature.get('COLOR') || '#eee');
            color[3] = 0.85;
            return packColor(color);
          },
          opacity: function () {
            return 0.6;
          },
        },
      },
      stroke: {
        attributes: {
          color: function (feature) {
            const color = [...asArray(feature.get('COLOR') || '#eee')];
            color.forEach((_, i) => (color[i] = Math.round(color[i] * 0.75))); // darken slightly
            return packColor(color);
          },
          width: function () {
            return 1.5;
          },
          opacity: function () {
            return 1;
          },
        },
      },
    });
  }
}

const osm = new TileLayer({
  source: new OSM(),
});

const vectorLayer = new WebGLLayer({
  source: new VectorSource({
    // url: 'http://10.10.2.24:8080/data/vtile/{z}/{x}/{y}.pbf',
    url: 'http://10.10.2.24:8080/data/vtile/4/12/6.pbf',
    format: new MVT(),
  }),
});

const map = new Map({
  layers: [osm, vectorLayer],
  target: 'map',
  view: new View({
    center: [12000000, 4500000],
    zoom: 1,
  }),
});

