import mapboxgl from '@mapzone/mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

function main() {
  const keyMatch = location.search.match(/[\?\&]key=([^&]+)/i);
  const keyParam = keyMatch ? '?key=' + keyMatch[1] : '';
  const tk = '2db0ba5b3fa4414b2ea0ac2903d7519c';
  // const tk = 'c5e1b213ec92118ae92d18fc19883da0';

  const map = new mapboxgl.Map({
    container: 'map', // container id
    crs: 'EPSG:4490',
    center: [101.74721254733845, 32.5665352689922],
    zoom: 3,
    pitch: 0,
    hash: true,
    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tileSize: 256,
          //xyz形式，原生支持
          tiles: [`https://t2.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${tk}`],
        },
        'raster-tiles2': {
          type: 'raster',
          tileSize: 256,
          //xyz形式，原生支持
          tiles: [`https://t3.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=${tk}`],
        },
        vector_layer_: {
          type: 'vector',
          url: '../data/vtile.json' + keyParam,
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': 'transparent',
          },
        },
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: 'simple-tiles2',
          type: 'raster',
          source: 'raster-tiles2',
          minzoom: 0,
          maxzoom: 22,
        },
        // {
        //   id: 'vector_layer__xh_realtime_points_circle',
        //   type: 'circle',
        //   source: 'vector_layer_',
        //   'source-layer': 'xh_realtime_points',
        //   filter: ['==', '$type', 'Point'],
        //   paint: {
        //     'circle-color': 'red',
        //     'circle-radius': 2,
        //   },
        // },
      ],
    },
  });
  map.on('load', (e) => {
    // const inspect = new MapboxInspect({ showInspectMap: true, backgroundColor: 'transparent', showInspectButton: false });
    // map.addControl(inspect);
    map.addControl(new mapboxgl.NavigationControl());

    // 轨迹点
    // map.loadImage('../images/point3.png', (error, image) => {
    //   if (error) throw error;
    //   map.addImage('point3', image);
    //   map.addLayer({
    //     id: 'vector_layer__xh_realtime_points_symbol',
    //     type: 'symbol',
    //     source: 'vector_layer_',
    //     'source-layer': 'xh_realtime_points',
    //     filter: ['==', '$type', 'Point'],
    //     layout: {
    //       'icon-image': 'point3',
    //       'text-field': ['get', 'title'],
    //       'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    //       'text-offset': [0, 1.25],
    //       'text-anchor': 'top',
    //     },
    //   });
    // });

    // 绘制
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      defaultMode: 'draw_polygon',
      controls: {
        polygon: true,
        point: true,
        trash: true,
      },
    });
    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

    function updateArea(e: any) {
      const data = draw.getAll();
      const answer = document.getElementById('calculated-area');
      if (data.features.length > 0) {
        const area = turf.area(data);
        // Restrict the area to 2 decimal points.
        const rounded_area = Math.round(area * 100) / 100;
        // answer.innerHTML = `<p><strong>${rounded_area}</strong></p><p>square meters</p>`;
      } else {
        // answer.innerHTML = '';
        if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
      }
    }
    map.addControl(draw);

    (window as any)._map = map;
  });
}

main();
