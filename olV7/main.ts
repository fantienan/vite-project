import MVT from 'ol/format/MVT.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js'; 
import WebGLTileLayer from 'ol/layer/WebGLTile.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import { Icon, Style } from 'ol/style.js';
import {get as getProjection} from 'ol/proj.js';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import Layer from 'ol/layer/Layer.js';
import {asArray} from 'ol/color.js';
import {packColor} from 'ol/renderer/webgl/shaders.js';
    var pointStyle1: Style | null = null;
    var pointStyle2: Style | null= null;
    var pointStyle3: Style | null= null;
    var pointStyle4: Style | null= null;
    var imgSize = [4,4];
// Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
const resolutions: number[] = [];
for (let i = 0; i <= 8; ++i) {
  resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}
// Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
function tileUrlFunction(tileCoord) {
  return (
    'http://10.10.2.24:8080/data/vtile/{z}/{x}/{y}.pbf'
  )
    .replace('{z}', String(tileCoord[0] * 2 - 1))
    .replace('{x}', String(tileCoord[1]))
    .replace('{y}', String(tileCoord[2]))
}

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
getPointStyle().then(() => {
  const map = new Map({
    layers: [
      new WebGLTileLayer({ source: new OSM() }),
      // new WebGLLayer({
      new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          tileGrid: new TileGrid({
            extent: getProjection('EPSG:3857')!.getExtent(),
            resolutions: resolutions,
            tileSize: 512,
          }),
          tileUrlFunction: tileUrlFunction,
        }),
        style: () => pointStyle1!
      }),
    ],
    target: 'map',
    view: new View({
      center: [12000000, 4500000],
      projection: 'EPSG:3857',
      minZoom: 1,
      zoom: 2,
    }),
  });
})


function getPointStyle() {
    return new Promise((resolve) => {
        if (pointStyle1) {
            resolve(pointStyle1)
            return 
        }
        const point1Image = './images/point1.png' 
        const point2Image = './images/point2.png' 
        const point3Image = './images/point3.png' 
        const point4Image = './images/point4.png' 
        Promise.all([loadImage(point1Image), loadImage(point2Image), loadImage(point3Image), loadImage(point4Image)]).then(res => {
            pointStyle1 = new Style({
                image: new Icon({ img: res[0], imgSize: imgSize, })
            });
            pointStyle2 = new Style({
                image: new Icon({ img: res[1], imgSize: imgSize, })
            });
            pointStyle3 = new Style({
                image: new Icon({ img: res[2], imgSize: imgSize, })
            });
            pointStyle4 = new Style({
                image: new Icon({ img: res[3], imgSize: imgSize, })
            });
            resolve(pointStyle1)
        })
    })
}

function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function () {
            reject(new Error('Could not load image at ' + url));
        };
        img.src = url;
    });
}
