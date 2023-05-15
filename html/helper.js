const layerConfigs = window._layerConfigs;
const mapSettings = {
    WKID: '4490', // 地理坐标参考
    EXTENT: [-180, -90, 180, 90],// minx,miny,maxx,maxy
    CENTER: [108.77, 34.39],
    ZOOM: 4,
    MAXZOOM: 18,
    MINZOOM: 1
};
const maxZoom = mapSettings.MAXZOOM;
const epsg = "EPSG:" + mapSettings.WKID;
const projection = new ol.proj.Projection({
    code: epsg,
    units: ol.proj.Units.DEGREES,
    extent: mapSettings.EXTENT
});
const info = [
    {maxZoom: 6, ratio: 0.15},
    {maxZoom: 12, ratio: 0.33, stride: 20},
    {maxZoom: 18, ratio: 0.50, stride: 10},
    {maxZoom: 22, ratio: 1, stride: 5},

]

/**
 * @description 辅助工具类   
 */
function Helper() { 
    this.geoJsonGormat = null;
    this.pointVectorSource = null;
    this.pointVectorLayer = null;
    this.gridVectorSource = null;
    this.gridVectorLayer = null
    this.view = null;
    this.map = null;
    this.pointStyle = null;
    this.gridStride = null;
    this.layerFactory = new LayerFactory();
    this.sourceCollection = null;
    this.dataSource = null;
};

/**
 * 
 * @param {HTMLElement} target 
 */
Helper.prototype.initMap = function(target) {
    this.geoJsonGormat = new ol.format.GeoJSON();
    this.pointVectorSource = new ol.source.Vector({ features: [] });
    this.pointVectorLayer = new ol.layer.Vector({ source: this.pointVectorSource, zIndex: 999999 });
    this.layerFactory.init(projection)
    this.view = new ol.View({
        center: mapSettings.CENTER,
        zoom: mapSettings.ZOOM,
        maxZoom: mapSettings.MAXZOOM,
        minZoom: mapSettings.MINZOOM,
        projection: projection
    });

    this.map = new ol.Map({
        renderer:  ['webgl', 'canvas'],
        target: target,
        view: this.view,
    });

    this.map.addLayer(this.pointVectorLayer);
    this.getLayers();
    this.bindEvent();
    this.setZoom();
    this.geoJson1to6 = null;
    this.features1to6 = []; 

    this.source7to12Collection = new SourceCollection({map: this.map, stride: info[1].stride, });
    this.source13to18Collection = new SourceCollection({map: this.map, stride: info[2].stride, });
    this.source19Collection = new SourceCollection({map: this.map, stride: info[3].stride});
}

Helper.prototype.getPointStyle = function() {
    return new Promise((resolve) => {
        if (this.pointStyle) {
            resolve(this.pointStyle)
            return 
        }
        const pointImage = '../public/images/point.png' 
        const point1Image = '../public/images/point1.png' 

        this.loadImage(point1Image).then((img) => {
            this.pointStyle = new ol.style.Style({
                image: new ol.style.Icon({ img: img, imgSize: [2,2], })
            });
            resolve(this.pointStyle)
        })
    })
}

Helper.prototype.setPointSources = function(geoJson) {
    this.geoJson1to6 = { ...geoJson, features: this.filterDataSourceByZoom(geoJson.features, 1) };
    this.source7to12Collection.setGeoJson(geoJson, this.filterDataSourceByZoom(geoJson.features, 7))
    this.source13to18Collection.setGeoJson(geoJson, this.filterDataSourceByZoom(geoJson.features, 13))
    this.source19Collection.setGeoJson(geoJson, this.filterDataSourceByZoom(geoJson.features, 19))
    console.log(this.geoJson1to6)
    console.log(this.source7to12Collection)
    console.log(this.source13to18Collection)
    console.log(this.source19Collection)
}

Helper.prototype.renderPoints = function() {
    return new Promise((resolve) => {
        this.getPointStyle().then(() => {
            let features = this.getSource();
            if (!features || !features.length) {
                const geoJson = this.getGeoJson();
                features = this.geoJsonGormat.readFeatures(geoJson);
                // this.saveSource(features);
            }
            this.pointVectorLayer.setStyle(this.pointStyle)
            this.pointVectorSource.clear();
            this.pointVectorSource.addFeatures(features)
            resolve({features})
        })

    })
}

Helper.prototype.getGeoJson = function() {
    const zoom = this.getZoom();
    const extent = this.getViewExtent();
    if (zoom <= info[0].maxZoom) {
        return this.geoJson1to6;
    } 
    if (zoom <= info[1].maxZoom) {
        return this.source7to12Collection.getGeoJsonByExtent(extent);
    } 
    if (zoom <= info[2].maxZoom) {
        return this.source13to18Collection.getGeoJsonByExtent(extent);
    } 
    return this.source19Collection.getGeoJsonByExtent(extent);
}

Helper.prototype.getViewExtent = function() {
    return this.view.calculateExtent(this.map.getSize());
}

Helper.prototype.getSource = function() {
    const zoom = this.getZoom();
    const extent = this.getViewExtent();
    return []
    if (zoom <= info[0].maxZoom) {
        return this.features1to6;
    } 
    if (zoom <= info[1].maxZoom) {
        return this.source7to12Collection.getSourceByExtent(extent)
    } 
    if (zoom <= info[2].maxZoom) {
        return this.source13to18Collection.getSourceByExtent(extent);
    }
    return this.source19Collection.getSourceByExtent(extent)
}

Helper.prototype.saveSource = function(features) {
    const zoom = this.getZoom();
    const extent = this.getViewExtent();
    if (zoom <= info[0].maxZoom) {
        this.features1to6 = features;
    } else if (zoom <= info[1].maxZoom) {
        this.source7to12Collection.save(features, extent);
    } else if (zoom <= info[2].maxZoom) {
        this.source13to18Collection.save(features, extent);
    } else {
        this.source19Collection.save(features, extent)
    }
}

Helper.prototype.getLayers = function() {
    for (let i = 0; i < layerConfigs.length; i++)  {
        const layer = this.layerFactory.getLayer(layerConfigs[i])
        this.map.addLayer(layer)
    }

}

Helper.prototype.clear = function() {
    this.pointVectorSource.clear();
}

Helper.prototype.bindEvent = function() {
    this.map.on('pointermove',function(e) {
        this.setCoordinaties(e.coordinate);
    }, this)

    this.map.on('moveend', function() {
        this.setZoom();

    }, this)

}

Helper.prototype.setCoordinaties = function(coordinaties) {
    document.getElementById('coord').innerHTML = coordinaties.map(v => Math.floor(v * 1000) / 1000).join();
}

Helper.prototype.getZoom = function() {
    return Math.floor(this.map.getView().getZoom() * 10) / 10;
}

Helper.prototype.setZoom = function() {
    const zoom = this.getZoom();
    document.getElementById('zoom').innerHTML = zoom;
    return zoom;
}
/**
 * 
 * @description 如果需要从一个数组中按一定比例抽取元素，可以通过计算数组长度和抽取比例来确定抽取的元素数量，然后再根据元素数量计算出每个元素之间的索引跨度值。
 * @param {number} length 数组长度
 * @param {number} ratio 抽取比例 小于1的小数
 * @returns {number} 索引跨度值
 */
Helper.prototype.getStride = function(length, ratio) {
    // 抽取的元素数量
    const count = Math.round(length * ratio);
    // 计算每个元素之间的索引跨度值
    const stride = Math.round(length / count);
    return stride;
}

/**
 * 
 * @description 根据跨度过滤数据源
 * @param {Array} dataSource 数据源 
 * @param {number} indexStride 索引跨度值 
 * @returns {Array} 
 */
Helper.prototype.filterDataSourceByIndexStride = function (dataSource, indexStride) {
    const filteredDataSource = dataSource.filter(function (_, index) {
        const flag = index % indexStride === 0;
        return flag;
    })
    
    return filteredDataSource
}

/**
 * 
 * @description 根据级别过滤数据源
 * @param {Array} dataSource 数据源 
 * @param {number} zoom 级别 1-22的数字
 * @returns {Array}
 */
Helper.prototype.filterDataSourceByZoom = function(dataSource, zoom) {
    
    let ratio = 1;
    if (zoom <= info[0].maxZoom) {
        ratio = info[0].ratio
    } else if (zoom <= info[1].maxZoom) {
        ratio = info[1].ratio
    } else if (zoom <= info[2].maxZoom) {
        ratio = info[2].ratio
    } else {
        return dataSource
    }
    
    const d = this.filterDataSourceByIndexStride(dataSource, this.getStride(dataSource.length, ratio))
    
    return d;
}

/**
 *
 * @description 计算两点距离 
 * @param {number[]} a 经纬度坐标 
 * @param {number[]} b 经纬度坐标
 * @returns {number}
 */
Helper.prototype.length = function (a, b) {
    return Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
};

/**
 *
 * @description 加载图片 
 * @param {string} url 图片资源地址 
 * @returns {Promise<HTMLImageElement>}  
 */
Helper.prototype.loadImage = function (url) {
    return new Promise((resolve, reject) => {
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

/**
 * 
 * @param {string} url 资源地址
 * @returns {Promise} 
 */
Helper.prototype.fetchDataByScript = function(url) {
    return new Promise(function(resolve) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = function() {
          resolve(window.geojson)
          script.remove()
        };
        script.src = url;
        document.head.appendChild(script);
    })
}
window.Helper = Helper;