import { useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import * as geom from 'ol/geom';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { fromLonLat } from 'ol/proj';
import './ol.css'

// import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
// import TileLayer from 'ol/layer/Tile';
// import View from 'ol/View';

export default () => {
  useEffect(() => {

async    function main() {

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
              center: [12204026.367407095, 4138380.197581934],
    zoom: 4,
  }),
});
          // window._map = map

          const res = await fetch('data/xh_realtime_point.txt').then(res => res.text())
          if (!res) return

          const features: any[] = []
          const errorData = []
          const data = res.split('\n')
          const fieldnames = data[0].split(',').map(item => item.replaceAll('\r',''));
          const dataSource = data.slice(1).map(item => {
            const obj: any = {}
            const arr = item.split(',')
            fieldnames.forEach((field, index) => {
              obj[field] = (arr[index]??"").replaceAll("|",'').replaceAll("\r",'').trim();
            })
            if (arr.length !== fieldnames.length){
              errorData.push(obj);
            } else {
              features.push(new Feature({
                geometry: new geom.Point(fromLonLat([obj.lon, obj.lat]))
              })) 
              return obj
            }
          }).filter(item => item)
          var vectorLayer = new VectorLayer({
            source: new VectorSource({
              features: []
            }),
            style: new Style({
              image: new Circle({

                radius: 6,
                fill: new Fill({
                  color: 'red'
                }),
                stroke: new Stroke({
                  color: 'white',
                  width: 2
                })
              })
            })
          });
          map.addLayer(vectorLayer);
          document.getElementById('total')!.innerHTML = `总共${dataSource.length}条数据，错误${errorData.length}条数据`

          const html = Array(Math.floor(features.length / 10000)).fill(0).map((item, index) => {
            if (index === 0) {
              return `<option value="all">全部</option>`
            }
            return `<option value="${index * 10000}">${`${index}万`}</option>`
          }).join('');
          document.getElementById('featuer-select')!.innerHTML =html; 
          document.getElementById('featuer-select')!.addEventListener('change', (e:any) => {
            const value = e.target.value
            if (value === 'all') {
              vectorLayer.getSource()?.clear()
              vectorLayer.getSource()?.addFeatures(features)
            } else {
              const filterFeatures = features.slice(0,value);
              vectorLayer.getSource()?.clear()
              vectorLayer.getSource()?.addFeatures(filterFeatures)
            }
          })
        }
main()
  }, [])
    return <>
    <div id="map" style={{height: '90vh', width: '100%'}}></div>
    <div id="total"></div>
    <select id="featuer-select">
      <option value="all">全部</option>
    </select>
    </>
}