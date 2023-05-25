// http://vtctest.geo-compass.com/geocmap/api/v1/map/10001000191/publish
// https://docs.mapbox.com/mapbox-gl-js/api/

const BASECOORDS = [114.763184, 37.822802];
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
    // $("#Checkbox_xian").attr("checked",false)//未选中
    // mbMap.setLayoutProperty('2', 'visibility', 'none');
    // $("#Checkbox_ldgx_big").attr("checked",false)//未选中
    // mbMap.setLayoutProperty('4', 'visibility', 'none');
    // $("#Checkbox_ldgx_big").attr("checked",false)//未选中
    // mbMap.setLayoutProperty('6', 'visibility', 'none');
    return
}
//当浏览器窗口大小改变时，设置显示内容的高度
window.onresize = function () {

}


var keyMatch = location.search.match(/[\?\&]key=([^&]+)/i);
var keyParam = keyMatch ? '?key=' + keyMatch[1] : '';

const mbMap = new mapboxgl.Map({
            style: {
                version: 8,
                sources: {
                    // 'raster-tiles': {
                    //     type: 'raster',
                    //     tileSize: 256,
                    //     //xyz形式，原生支持
                    //     "tiles": [
                    //         // 'https://t2.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=c5e1b213ec92118ae92d18fc19883da0',
                    //         // 'http://www.stgz.org.cn/MapzoneDataJH/aggregation/{z}/{x}/{y}/tile.png?maskid=&t=1684908050087&mapId=2ee9cafa-39a1-462f-84ac-1dc0099a1df3&maps=2ee9cafa-39a1-462f-84ac-1dc0099a1df3'
                    //     ]
                    // },
                    'vector_layer_': {
                        type: 'vector',
                        url: '../maplibre-gl-gui-ji/data/vtile.json' + keyParam
                    }
                },

                layers: [
                    // {
                    //     id: 'simple-tiles',
                    //     type: 'raster',
                    //     source: 'raster-tiles',
                    //     minzoom: 0,
                    //     maxzoom: 22
                    // },
                ]
            },
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


var inspect = new MapboxInspect({
  showInspectMap: true,
  backgroundColor: 'transparent',
  showInspectButton: false
});
mbMap.addControl(inspect);
const mbLayer = new ol.layer.Layer({
    render: function (frameState) {
        const canvas = mbMap.getCanvas();
        const viewState = frameState.viewState;

        console.log(123123)
        const visible = mbLayer.getVisible();
        canvas.style.display = visible ? 'block' : 'none';

        const opacity = mbLayer.getOpacity();
        canvas.style.opacity = opacity;

        // adjust view parameters in mapbox
        const rotation = viewState.rotation;
        mbMap.jumpTo({
        //    center: ol.proj.toLonLat(viewState.center),
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
        zoom: 4,
    }),
    layers: [],
});

map.addLayer(tdtimgLayer);
map.addLayer(tdtimgLabelLayer);
map.addLayer(mbLayer);




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

    //  mbMap_clickTo(e.pixel[0], e.pixel[1])
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
