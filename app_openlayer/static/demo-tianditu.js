// http://vtctest.geo-compass.com/geocmap/api/v1/map/10001000191/publish
// https://docs.mapbox.com/mapbox-gl-js/api/

BASECOORDS = [114.763184, 37.822802];


window.onload = function () {

}
//当浏览器窗口大小改变时，设置显示内容的高度
window.onresize = function () {

}

const mbMap = new mapboxgl.Map({
            style: 'http://vtctest.geo-compass.com/geocmap/api/v1/map/10001000191/publish',
            attributionControl: false,
            boxZoom: false,
            center: BASECOORDS,
            container: 'llmap',
            doubleClickZoom: false,
            dragPan: false,
            dragRotate: false,
            interactive: false,
            keyboard: false,
            pitchWithRotate: false,
            scrollZoom: false,
            touchZoomRotate: false,
});


const mbLayer = new ol.layer.Layer({
    render: function (frameState) {
        const canvas = mbMap.getCanvas();
        const viewState = frameState.viewState;

        const visible = mbLayer.getVisible();
        canvas.style.display = visible ? 'block' : 'none';

        const opacity = mbLayer.getOpacity();
        canvas.style.opacity = opacity;

        // adjust view parameters in mapbox
        const rotation = viewState.rotation;
        mbMap.jumpTo({
            center: ol.proj.toLonLat(viewState.center),
            zoom: viewState.zoom - 1,
            bearing: (-rotation * 180) / Math.PI,
            animate: false,
        });

        // cancel the scheduled update & trigger synchronous redraw
        // see https://github.com/mapbox/mapbox-gl-js/issues/7893#issue-408992184
        // NOTE: THIS MIGHT BREAK IF UPDATING THE MAPBOX VERSION
        if (mbMap._frame) {
            mbMap._frame.cancel();
            mbMap._frame = null;
        }
        mbMap._render();

        return canvas;
    },
    source: new ol.source.Source({
        attributions: [
            '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a>',
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
        ],
    }),
});

//const style = new ol.style.Style({
//    stroke: new ol.style.Stroke({
//        color: '#319FD3',
//        width: 2,
//    }),
//});
//
//const vectorLayer = new ol.layer.Vector({
//    source: new ol.source.Vector({
//        url: 'data/geojson/countries.geojson',
//        format: new ol.format.GeoJSON(),
//    }),
//    style: style,
//});

const map = new ol.Map({
    target: 'llmap',
    view: new ol.View({
        center: ol.proj.fromLonLat(BASECOORDS),
        zoom: 4,
    }),
//    layers: [mbLayer, vectorLayer],
    layers: [mbLayer],
});

