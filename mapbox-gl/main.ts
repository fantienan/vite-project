function main() {
  const keyMatch = location.search.match(/[\?\&]key=([^&]+)/i);
  const keyParam = keyMatch ? '?key=' + keyMatch[1] : '';
  const tk = '2db0ba5b3fa4414b2ea0ac2903d7519c';
  // const tk = 'c5e1b213ec92118ae92d18fc19883da0';

  const mbMap = new mapboxgl.Map({
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
  mbMap.on('load', (e) => {
    // const inspect = new MapboxInspect({ showInspectMap: true, backgroundColor: 'transparent', showInspectButton: false });
    // mbMap.addControl(inspect);
    mbMap.addControl(new mapboxgl.NavigationControl());

    // 轨迹点
    // mbMap.loadImage('../images/point3.png', (error, image) => {
    //   if (error) throw error;
    //   mbMap.addImage('point3', image);
    //   mbMap.addLayer({
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

    (window as any)._map = mbMap;
  });
}

main();
