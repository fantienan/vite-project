import Map from 'ol/Map';
import Source from 'ol/source/Source';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
// import {TileDebug} from 'ol/source';
import OSM from 'ol/source/OSM.js'; 
import MapLibreLayer from '@geoblocks/ol-maplibre-layer';
import MaplibreInspect from 'maplibre-gl-inspect';

const keyMatch = location.search.match(/[\?\&]key=([^&]+)/i);
const keyParam = keyMatch ? '?key=' + keyMatch[1] : '';

const maplibreGlLayer = new MapLibreLayer({
  maplibreOptions: {
    container: 'map',
    hash: true,
    style: {
      version: 8,
      sources: {
        'vector_layer_': {
          type: 'vector',
          url: '../maplibre-gl-gui-ji/data/vtile.json' + keyParam
        }
      },
      layers: []
    }
  },
});

const map = new Map({
  layers: [

    new TileLayer({ source: new OSM() }),

    maplibreGlLayer,
    // new TileLayer({
    //   source: new TileDebug(),
    // }),
  ],
  target: 'map',
  view: new View({
    center: [12000000, 4500000],
    zoom: 8,
  }),
});

const inspect = new MaplibreInspect({
  showInspectMap: true,
  showInspectButton: false,
  backgroundColor: 'transparent'
});
maplibreGlLayer.maplibreMap.addControl(inspect);