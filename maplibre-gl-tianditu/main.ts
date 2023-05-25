import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"
import styleJson from './style.json'
import type {StyleSpecification} from 'maplibre-gl'
 
/** maplibre-gl不支持经纬度服务 */
const style = styleJson as unknown as StyleSpecification;

style.sources['raster-tiles'] = {

    type: 'raster',
    tileSize: 256,
    //xyz形式，原生支持
    "tiles": [
        // 'https://t2.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=c5e1b213ec92118ae92d18fc19883da0'
        'http://www.stgz.org.cn/MapzoneDataJH/aggregation/{z}/{x}/{y}/tile.png?maskid=&t=1684908050087&mapId=2ee9cafa-39a1-462f-84ac-1dc0099a1df3&maps=2ee9cafa-39a1-462f-84ac-1dc0099a1df3'
    ]
}

style.layers.push({
    id: 'simple-tiles',
    type: 'raster',
    source: 'raster-tiles',
    minzoom: 0,
    maxzoom: 22
})

const map = new maplibregl.Map({
    container: 'map',
    center: [104.13669144100015,29.2878471785001],
    zoom: 3,
    hash:true,
    style,
});

map.on('mousemove', function (e) {
document.getElementById('info')!.innerHTML =
    // e.point is the x, y coordinates of the mousemove event relative
    // to the top-left corner of the map
    JSON.stringify(e.point) +
    '<br />' +
    // e.lngLat is the longitude, latitude geographical position of the event
    JSON.stringify(e.lngLat.wrap());
});