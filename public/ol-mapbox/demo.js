// http://vtctest.geo-compass.com/geocmap/api/v1/map/10001000191/publish
// https://docs.mapbox.com/mapbox-gl-js/api/

BASECOORDS = [114.763184, 37.822802];
//BASECOORDS = [0, 0];

function getResolutions(firstDpi) {
    var resolution = firstDpi ? firstDpi : 360 / (256 * 2);
    var resolutions = [];
    var matrixIds = [];
    for (var z = 0; z <= 19; ++z) {
        resolutions[z] = resolution / Math.pow(2, z);
        matrixIds[z] = z;
    };
    return {
        resolutions: resolutions,
        matrixIds: matrixIds
    }
}


window.onload = function () {
    $("#Checkbox_xian").attr("checked",false)//未选中
    mbMap.setLayoutProperty('2', 'visibility', 'none');
    $("#Checkbox_ldgx_big").attr("checked",false)//未选中
    mbMap.setLayoutProperty('4', 'visibility', 'none');
    $("#Checkbox_ldgx_big").attr("checked",false)//未选中
    mbMap.setLayoutProperty('6', 'visibility', 'none');
    return
}
//当浏览器窗口大小改变时，设置显示内容的高度
window.onresize = function () {

}

const style_mapboxgl = {
    "data_id":"1",
    "version":8,
    "name":"MAPZONE MVT DEMO",
//    "zoom":13,
    "center":[BASECOORDS[0], BASECOORDS[1]],
    "transition":{
        "delay":0,
        "duration":300
    },
    "glyphs":"http://vtctest.geo-compass.com/geocmap/api/v1/font/24/{fontstack}/{range}.pbf",
    "sprite":"http://vtctest.geo-compass.com/geocmap/api/v1/symbol/1/223/sprite",
    "sources":{
         "new_xian_512":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                "http://192.168.1.121:5001/GetNewMVTForMapboxGl/xian/512/{z}/{x}/{y}.mvt"
                  "http://127.0.0.1:5001/GetNewMVTForMapboxGl/xian/512/{z}/{x}/{y}.mvt"
            ]
        },
        "new_ldgx2020_ldgx2_p_512":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                "http://192.168.1.121:5001/GetNewMVTForMapboxGl/ldgx/512/{z}/{x}/{y}.mvt"
                   "http://127.0.0.1:5001/GetNewMVTForMapboxGl/ldgx/512/{z}/{x}/{y}.mvt"
            ]
        },
        "new_ldgx2020_ldgx2_p_4096":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                "http://192.168.1.121:5001/GetNewMVTForMapboxGl/ldgx/4096/{z}/{x}/{y}.mvt"
                  "http://127.0.0.1:5001/GetNewMVTForMapboxGl/ldgx/4096/{z}/{x}/{y}.mvt"
            ]
        },
        "guo_sheng_line_4096":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                  "http://192.168.1.121:5001/GetNewMVTForMapboxGl/guo_sheng_line/4096/{z}/{x}/{y}.mvt",
                  "http://127.0.0.1:5001/GetNewMVTForMapboxGl/guo_sheng_line/4096/{z}/{x}/{y}.mvt"
            ]
        },
        "shi_xian_line_4096":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                  "http://192.168.1.121:5001/GetNewMVTForMapboxGl/shi_xian_line/4096/{z}/{x}/{y}.mvt",
                  "http://127.0.0.1:5001/GetNewMVTForMapboxGl/shi_xian_line/4096/{z}/{x}/{y}.mvt"
            ]
        },
        "country_4096":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                  "http://192.168.1.121:5001/GetNewMVTForMapboxGl/country/4096/{z}/{x}/{y}.mvt",
                  "http://127.0.0.1:5001/GetNewMVTForMapboxGl/country/4096/{z}/{x}/{y}.mvt"
            ]
        },
        "lakes_4096":{
            "type":"vector",
//            "tileSize": "512",
            "tiles":[
//                  "http://192.168.1.121:5001/GetNewMVTForMapboxGl/lakes/4096/{z}/{x}/{y}.mvt",
                  "http://127.0.0.1:5001/GetNewMVTForMapboxGl/lakes/4096/{z}/{x}/{y}.mvt"
            ]
        },
    },
    "metadata":{
        "template":{

        },
        "layerIDMap":{

        }
    },
    "layers":[
        {
            "type":"background",
            "minzoom":0,
            "maxzoom":20,
            "paint":{
//                "background-color":"#000000"
                  "background-color":"#AAC6EE"
            },
            "id":"0"
        },
         {
            "type":"fill",
            "source":"country_4096",
            "source-layer":"country",
            "minzoom":0,
            "maxzoom":20,
            "paint":{
                "fill-color":"#F5F4EE"
            },
            "id":"1"
        },
        {
            "type":"fill",
            "source":"lakes_4096",
            "source-layer":"lakes",
            "minzoom":0,
            "maxzoom":20,
            "paint":{
                "fill-color":"#AAC6EE"
            },
            "id":"lakes"
        },
//        {
//            "type":"line",
//            "source":"new_xian_512",
//            "source-layer":"xian",
//            "minzoom":3,
//            "maxzoom":20,
//            "paint":{
//                "line-color":"#DC143C",
//                "line-width":2,
//            },
//            "id":"2"
//        },
         {
            "type":"fill",
            "source":"new_xian_512",
            "source-layer":"xian",
            "minzoom":3,
            "maxzoom":20,
            "paint":{
                "fill-opacity":0
            },
            "id":"2"
        },
        {
            "type":"fill",
            "source":"new_ldgx2020_ldgx2_p_512",
            "source-layer":"ldgx2020_ldgx2_p",
            "minzoom":5,
            "maxzoom":20,
            "paint":{
                "fill-outline-color":"#00FFFF",
                "fill-color":"#C71585"
            },
            "id":"3"
        },
        {
            "type":"fill",
            "source":"new_ldgx2020_ldgx2_p_4096",
            "source-layer":"ldgx2020_ldgx2_p",
            "minzoom":5,
            "maxzoom":20,
            "paint":{
                "fill-outline-color":"#00FFFF",
                "fill-color":"#C71585"
            },
            "id":"4"
        },
        {
            "id":"5",
            "type":"symbol",
            "source":"new_ldgx2020_ldgx2_p_512",
            "source-layer":"ldgx2020_ldgx2_p",
            "minzoom":11,
            "maxzoom":20,
            "layout":{
                "symbol-placement":"point",
                "symbol-spacing":500,
//                "icon-image":"shengdao1",
                "text-field":"{di_lei}",
                "text-font":[
                    "SimHei Regular"
                ],
                "text-size":12
            },
            "paint":{
                "icon-halo-color":"#ffffff",
                "icon-halo-width":1,
                "text-color":"rgb(253,253,253)",
                "text-halo-color":"#ffffff",
                "text-halo-width":0.3
            },
            "filter":[
                "all",
                [
                    "!=",
                    "di_lei",
                    ""
                ]
            ]
        },
        {
            "type":"fill",
            "source":"new_xian_512",
            "source-layer":"xian",
            "minzoom":3,
            "maxzoom":20,
            "paint":{
                "fill-outline-color":"#00FFFF",
                "fill-color":"#C71585"
            },
            "filter": ['in', 'pk_uid', ''],
            "id":"6",
        },
        {
            "type":"line",
            "source":"shi_xian_line_4096",
            "source-layer":"xian_line",
            "minzoom":8,
            "maxzoom":20,
            "paint":{
                "line-color":"#2DB427",
                "line-width":2,
            },
            "id":"zq_xian"
        },
        {
            "type":"line",
            "source":"shi_xian_line_4096",
            "source-layer":"shi_line",
            "minzoom":6,
            "maxzoom":11,
            "paint":{
                "line-color":"#AA0AB0",
                "line-width":2,
            },
            "id":"zq_shi"
        },
        {
            "type":"line",
            "source":"guo_sheng_line_4096",
            "source-layer":"sheng_line",
            "minzoom":0,
            "maxzoom":10,
            "paint":{
                "line-color":"#A08C82",
                "line-width":3,
            },
            "id":"zq_sheng"
        },
        {
            "type":"line",
            "source":"guo_sheng_line_4096",
            "source-layer":"china_line",
            "minzoom":0,
            "maxzoom":10,
            "paint":{
                "line-color":"#8A7557",
                "line-width":4,
            },
            "id":"zq_china"
        },
    ],
    "metadata":{
        "layerIDMap":{
            "背景":[
                "0",
                "1",
                "lakes",
            ],
            "xian":[
                "2",
                "6"
            ],
            "ldgx2020_ldgx2_p":[
                "3",
                "4",
                "5",
            ],
            "zq":[
                "zq_china",
                "zq_sheng",
                "zq_shi",
                "zq_xian",
            ]
        }
    }
}

const mbMap = new mapboxgl.Map({
            style: style_mapboxgl,
            crs: 'EPSG:4490',
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

//console.log(mbMap)


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
//            center: ol.proj.toLonLat(viewState.center),
            center: viewState.center,
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
            '<a href="http://www.forestar.com.cn/" target="_blank">© 地林伟业官网</a>'
        ],
    }),
});

proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs")

//设置坐标系为4490
var projection = new ol.proj.Projection({
    code: "EPSG:4490",
    units : 'degrees',
    extent: [-180, -90, 180, 90]
});

/**
 * 天地图
 * @constructor
 */
function getTDTLayer(url){
    var rs = getResolutions(0.703125);
    var layer = new ol.layer.Tile({
        visible:true,
        maxResolution: rs.resolutions[0],
        minResolution: rs.resolutions[18],
        source: new ol.source.XYZ({
            projection: projection,
            tileUrlFunction: function (tileCoord) {
//                console.log(tileCoord)
                var z = tileCoord[0]+1;
                var x = tileCoord[1];
                var y = tileCoord[2];
                var serverId = Math.round(Math.random() * 7);
                url = url.replace(/\{[0-9]-[0-9]\}/, serverId);
                return url.replace('{z}', z.toString())
                    .replace('{y}', y.toString())
                    .replace('{x}', x.toString());
            },
            tileGrid: new ol.tilegrid.TileGrid({
                extent:[-180, -90, 180, 90],
                origin: [-180, 90],
                resolutions: rs.resolutions,
                tileSize: 256
            }),
        })
    });
    return layer;
}

var tdtimgLayer = getTDTLayer("http://t{0-7}.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=abcd5984658840bdd7f99f40b7a85313");
var tdtimgLabelLayer = getTDTLayer("http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=abcd5984658840bdd7f99f40b7a85313");

const map = new ol.Map({
    target: 'llmap',
    view: new ol.View({
        projection : projection,// 坐标投影显示属性
        center: BASECOORDS,
        zoom: 13,
    }),
    layers: [],
});

map.addLayer(mbLayer);
//map.addLayer(tdtimgLayer);
//map.addLayer(tdtimgLabelLayer);




//初始化鼠标位置控件
var mousePositionControl = new ol.control.MousePosition({
    //样式类名称
    className: 'mosuePosition',
    //投影坐标格式，显示小数点后边多少位
    coordinateFormat: ol.coordinate.createStringXY(8),
    //指定投影
    projection: 'EPSG:4490',
    //目标容器
    target:document.getElementById('myposition')
});

//将鼠标位置坐标控件加入到map中
map.addControl(mousePositionControl);

//添加比例尺控件
map.addControl(new ol.control.ScaleLine());
//添加缩放控件
map.addControl(new ol.control.Zoom());
//添加缩放滑动控件
map.addControl(new ol.control.ZoomSlider());
//添加缩放到当前视图滑动控件
map.addControl(new ol.control.ZoomToExtent());
//添加全屏控件
map.addControl(new ol.control.FullScreen());
//添加旋转控件
map.addControl(new ol.control.Rotate({
    autoHide: false
}));
//添加属性控件
map.addControl(new ol.control.Attribution());


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////事件
function Checkbox_background_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setLayoutProperty('0', 'visibility', 'visible');
        mbMap.setLayoutProperty('1', 'visibility', 'visible');
        mbMap.setLayoutProperty('lakes', 'visibility', 'visible');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setLayoutProperty('0', 'visibility', 'none');
        mbMap.setLayoutProperty('1', 'visibility', 'none');
        mbMap.setLayoutProperty('lakes', 'visibility', 'none');
    }
}


function Checkbox_xian_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setLayoutProperty('2', 'visibility', 'visible');
        mbMap.setLayoutProperty('6', 'visibility', 'visible');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setLayoutProperty('2', 'visibility', 'none');
        mbMap.setLayoutProperty('6', 'visibility', 'none');
    }
}


function Checkbox_ldgx_small_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setLayoutProperty('3', 'visibility', 'visible');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setLayoutProperty('3', 'visibility', 'none');
    }
}

//默认第四个图层隐藏
//mbMap.setLayoutProperty('4', 'visibility', 'none');
function Checkbox_ldgx_big_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setLayoutProperty('4', 'visibility', 'visible');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setLayoutProperty('4', 'visibility', 'none');
    }
}

function Checkbox_label_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setLayoutProperty('5', 'visibility', 'visible');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setLayoutProperty('5', 'visibility', 'none');
    }
}

function Checkbox_change_color_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setPaintProperty('3', 'fill-color', '#C71585');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setPaintProperty('3', 'fill-color', '#2E8B57');
    }
}

function Checkbox_zq_line_checked(para){
    if(para.checked){
        //选中checkbox要做的操作
//        console.log("checked")
        mbMap.setLayoutProperty('zq_china', 'visibility', 'visible');
        mbMap.setLayoutProperty('zq_sheng', 'visibility', 'visible');
        mbMap.setLayoutProperty('zq_shi', 'visibility', 'visible');
        mbMap.setLayoutProperty('zq_xian', 'visibility', 'visible');
    }else{
        //取消选中checkbox要做的操作
//        console.log("unchecked")
        mbMap.setLayoutProperty('zq_china', 'visibility', 'none');
        mbMap.setLayoutProperty('zq_sheng', 'visibility', 'none');
        mbMap.setLayoutProperty('zq_shi', 'visibility', 'none');
        mbMap.setLayoutProperty('zq_xian', 'visibility', 'none');
    }
}


// 点击事件
map.on('click', function (e) {
//     console.log("map click")
//     console.log(e.pixel)

     mbMap_clickTo(e.pixel[0], e.pixel[1])
     return
})

function mbMap_clickTo(x, y){
    // Set `bbox` as 5px reactangle area around clicked point.
    const bbox = [
        [x - 1, y - 1],
        [x + 1, y + 1]
    ];
    console.log(bbox)
    // Find features intersecting the bounding box.
    const selectedFeatures = mbMap.queryRenderedFeatures(bbox, {
        layers: ['2']
    });
    const fips = selectedFeatures.map(
        (feature) => feature.properties.pk_uid
    );
    // Set a filter matching selected features by FIPS codes
    // to activate the 'counties-highlighted' layer.
    console.log(fips)
    mbMap.setFilter('6', ['in', 'pk_uid', ...fips]);
}


