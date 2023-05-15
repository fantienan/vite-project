import Feature from "ol/Feature"
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";

export const predefinedStyles = {
  'icons': {
    symbol: {
      symbolType: 'image',
      src: 'data/icon.png',
      size: [18, 28],
      color: 'lightyellow',
      rotateWithView: false,
      offset: [0, 9],
    },
  },
  'triangles': {
    symbol: {
      symbolType: 'triangle',
      size: 18,
      color: [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        20000,
        '#5aca5b',
        300000,
        '#ff6a19',
      ],
      rotateWithView: true,
    },
  },
  'triangles-latitude': {
    symbol: {
      symbolType: 'triangle',
      size: [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        40000,
        12,
        2000000,
        24,
      ],
      color: [
        'interpolate',
        ['linear'],
        ['get', 'latitude'],
        -60,
        '#ff14c3',
        -20,
        '#ff621d',
        20,
        '#ffed02',
        60,
        '#00ff67',
      ],
      offset: [0, 0],
      opacity: 0.95,
    },
  },
  'circles': {
    symbol: {
      symbolType: 'circle',
      size: [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        40000,
        8,
        2000000,
        28,
      ],
      color: ['match', ['get', 'hover'], 1, '#ff3f3f', '#006688'],
      rotateWithView: false,
      offset: [0, 0],
      opacity: [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        40000,
        0.6,
        2000000,
        0.92,
      ],
    },
  },
  'circles-zoom': {
    symbol: {
      symbolType: 'circle',
      size: ['interpolate', ['exponential', 2.5], ['zoom'], 2, 1, 14, 32],
      color: ['match', ['get', 'hover'], 1, '#ff3f3f', '#006688'],
      offset: [0, 0],
      opacity: 0.95,
    },
  },
  'rotating-bars': {
    symbol: {
      symbolType: 'square',
      rotation: ['*', ['time'], 0.1],
      size: [
        'array',
        4,
        [
          'interpolate',
          ['linear'],
          ['get', 'population'],
          20000,
          4,
          300000,
          28,
        ],
      ],
      color: [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        20000,
        '#ffdc00',
        300000,
        '#ff5b19',
      ],
      offset: [
        'array',
        0,
        [
          'interpolate',
          ['linear'],
          ['get', 'population'],
          20000,
          2,
          300000,
          14,
        ],
      ],
    },
  },
}

export const txt2GeoJSON = async () => {

// 创建 GeoJSON 格式化器
const geojsonFormat = new GeoJSON();
          const res = await fetch('data/xh_realtime_point.txt').then(res => res.text())
          if (!res) return
          const features: Feature[] = [];
          const data = res.split('\n')
          const fieldnames = data[0].split(',').map(item => item.replaceAll('\r',''));
          const errorData: Record<string, any>[] = []
          const dataSource = data.slice(1).map(item => {
            const obj:Record<string, any> = {}
            const arr = item.split(',')
            fieldnames.forEach((field, index) => {
              obj[field] = (arr[index]??"").replaceAll("|",'').replaceAll("\r",'').trim();
            })
            if (arr.length !== fieldnames.length){
              errorData.push(obj);
            } else {
              const {lon, lat,...rest} = obj
              const feature = new Feature({ geometry: new Point(fromLonLat([lon, lat])) })
              // feature.setProperties(rest)
              // 将经纬度信息的 JSON 对象转换为 GeoJSON 字符串
              features.push(feature) 
              return obj
            }
          }).filter(item => item)

const geojson = geojsonFormat.writeFeatures(features, {
  // dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:4490'
});
console.log(geojson)

return geojson

}