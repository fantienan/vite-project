/**
 * 1. 根据不同的级别范围按照不同的比例均匀抽取数据
 * 2. 每一个级别范围对应一个数据源
 * 3. 根据不同的级别范围对抽取后的数据按块（四至）分组存储到数据源中
 * 4. 缩放和移动时
 *      通过四至获取数据源中的数据块
 *      根据数据块中的点绘制要素并缓存到数据源中，缓存要素、是否需要绘制要素的标识（默认是true，绘制过后设置为false）,缓存更新策略∶用户主动更新和定时更新
 * 5. 通过坐标绘制要素
 *      将点坐标存不到任务队列中
 *      使用requestIdleCallback在浏览器空闲时间内绘制要素，可以随时中断绘制，避免绘制过程中频道移动缩放导致卡顿情况
 */
const layerConfigs = window._layerConfigs;
const mapSettings = {
    WKID: '4490', // 地理坐标参考
    EXTENT: [-180, -90, 180, 90],// minx,miny,maxx,maxy
    CENTER: [107.802,28.91],
    ZOOM: 4,
    // MAXZOOM: 6,
    MAXZOOM: 18,
    MINZOOM: 4
};
const maxZoom = mapSettings.MAXZOOM;
const epsg = "EPSG:" + mapSettings.WKID;
const projection = new ol.proj.Projection({
    code: epsg,
    units: ol.proj.Units.DEGREES,
    extent: mapSettings.EXTENT
});
const info = [
    {maxZoom: 6, ratio: 0.1, stride: 20},
    {maxZoom: 12, ratio: 0.10, stride: 15},
    {maxZoom: 18, ratio: 0.50, stride: 5},
    {maxZoom: 22, ratio: 1, stride: 3},

]

const getInfo = (zoom) => {
    if (zoom <= info[0].maxZoom) {
        return info[0];
    } 
    if (zoom <= info[1].maxZoom) {
        return info[1];
    } 
    if (zoom <= info[2].maxZoom) {
        return info[2];
    } 
    return info[3];

}

/**
 * 开发调试
 */
window._stopUpdateSource_ = false; // 停止更新数据源
window._stopUpdatePoints_ = false; // 停止更新点

/**
 * @description 辅助工具类   
 */
function Helper(props) { 
    this.extent = [70, 15, 136, 55];
    this.geoJsonGormat = null;
    this.pointVectorSource = null;
    this.pointVectorLayer = null;
    this.gridVectorSource = null;
    this.gridVectorLayer = null
    this.view = null;
    this.map = null;
    this.pointStyle = null;
    this.pointStyle1 = null;
    this.pointStyle2 = null;
    this.gridStride = null;
    this.layerFactory = new LayerFactory();
    this.sourceCollection = null;
    this.dataSource = null;
    this.zoom = null;
    this.center = []
    this.enqueue = new Enqueue();
    this.reconciliation = this.setReconciliation(props?.reconciliation ?? false)
    this.reconciliationTaskNumber = 5;
    this.whenMoveAndUpdatePoints = true;
    window._helper = this;
};

/**
 * 
 * @param {HTMLElement} target 
 */
Helper.prototype.initMap = function(target) {
    this.geoJsonGormat = new ol.format.GeoJSON();
    this.pointVectorSource = new ol.source.Vector({ features: [] });
    this.pointVectorLayer = new ol.layer.Vector({ source: this.pointVectorSource, zIndex: 999997 });
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
    this.createLayers();
    this.bindEvent();
    this.setZoom();
    this.zoom = this.getZoom();
    this.center = this.view.getCenter();
    this.whenMoveAndUpdatePoints = this.setWhenMoveAndUpdatePoints(this.extent)

    this.source1to6Collection = new SourceCollection({map: this.map, stride: info[0].stride, extent: this.extent });
    this.source7to12Collection = new SourceCollection({map: this.map, stride: info[1].stride, extent: this.extent});
    this.source13to18Collection = new SourceCollection({map: this.map, stride: info[2].stride, extent: this.extent});
    this.source19Collection = new SourceCollection({map: this.map, stride: info[3].stride, extent: this.extent});

}

Helper.prototype.bindEvent = function() {
    let timer = null;
    this.map.on('pointermove',function(e) {
        document.getElementById('coord').innerHTML = e.coordinate.map(v => Math.floor(v * 1000) / 1000).join();
    }, this)

    this.map.on('moveend', function() {
        if (timer) clearTimeout(timer)
        this.setZoom();
        timer = setTimeout(() => {
            this.updatePoints();
        }, 400)
    }, this)
}

Helper.prototype.setReconciliation = function(reconciliation) {
    this.reconciliation = reconciliation;
}

Helper.prototype.setWhenMoveAndUpdatePoints = function(extent) {
    return ol.extent.containsExtent(this.getViewExtent(),extent)
}


Helper.prototype.reconciliationRenderPoints = function() {
    console.log('reconciliationRenderPoints')
    return new Promise( (resolve) => {
        this.getPointStyle().then(async() => {
            const extents = this.getSourceCollection().getExtentsByExtent(this.getViewExtent());
            const beforeClearFeatureLength = this.pointVectorSource.getFeatures().length; 
            const clearedFeaturesLength = this.clearByExtents(extents);
            const afterClearFeatureLength = this.pointVectorSource.getFeatures().length
            let features = this.getCacheFeaturesByExtents(extents);
            if (!features || !features.length) {
                features = await this.renderFeaturesByExtent(extents, true)
                this.cacheFeaturesByExtents(features, extents);
            }
            this.log({
                beforeClearFeatureLength: beforeClearFeatureLength, 
                afterClearFeatureLength: afterClearFeatureLength,
                clearedFeaturesLength: clearedFeaturesLength,
                addFeatureLength: features.length,
                allFeatureLength: this.pointVectorSource.getFeatures().length, 
            })
            resolve({features})
        })

    })
}

Helper.prototype.batchRenderPoints = function() {
    console.log('batchRenderPoints')
    return new Promise( (resolve) => {
        this.getPointStyle().then(async() => {
            const extents = this.getSourceCollection().getExtentsByExtent(this.getViewExtent());
            const beforeClearFeatureLength = this.pointVectorSource.getFeatures().length; 
            const clearedFeaturesLength = this.clearByExtents(extents);
            const afterClearFeatureLength = this.pointVectorSource.getFeatures().length
            let features = this.getCacheFeaturesByExtents(extents);
            if (!features || !features.length) {
                features = await this.renderFeaturesByExtent(extents)
                this.cacheFeaturesByExtents(features, extents);
            }
            this.addFeatures(features)
            this.log({
                beforeClearFeatureLength: beforeClearFeatureLength, 
                afterClearFeatureLength: afterClearFeatureLength,
                clearedFeaturesLength: clearedFeaturesLength,
                addFeatureLength: features.length,
                allFeatureLength: this.pointVectorSource.getFeatures().length, 
            })
            resolve({features})
        })
    })
}

Helper.prototype.renderPoints = function() {
    return new Promise(resolve => {
        if (this.reconciliation) {
            this.enqueue.cancel()
            this.reconciliationRenderPoints().then(resolve)
        } else {
            this.batchRenderPoints().then(resolve)
        }
    })
}

Helper.prototype.updatePoints = function() {
    if (window._stopUpdatePoints_) return
    console.log('updatePoints')
    const prevWhenMoveAndUpdatePoints = this.whenMoveAndUpdatePoints;
    const zoom = this.getZoom()
    const prevZoom = this.zoom;
    const prevCenter = [...this.center];
    const prevZoomInfo = getInfo(prevZoom);
    const zoomInfo = getInfo(zoom);
    this.zoom = zoom;
    this.center = this.view.getCenter();
    this.whenMoveAndUpdatePoints = this.setWhenMoveAndUpdatePoints(this.extent)
    const isZoomChanged = zoom !== prevZoom;
    const isCenterChanged = prevCenter[0] !== this.center[0] || prevCenter[1] !== this.center[1];
    console.log(this.whenMoveAndUpdatePoints)
    if (!isZoomChanged && !isCenterChanged)  return
    // 全国范围内缩放
    if (prevZoomInfo.maxZoom === info[0].maxZoom && zoomInfo.maxZoom === info[0].maxZoom) {
        if (prevWhenMoveAndUpdatePoints && this.whenMoveAndUpdatePoints) return
    }
    this.renderPoints()
}


Helper.prototype.setCoordinates = function(coordinates) {
    this.source1to6Collection.setCoordinates(this.filterDataSourceByZoom(coordinates, 1))
    this.source7to12Collection.setCoordinates(this.filterDataSourceByZoom(coordinates, 7))
    this.source13to18Collection.setCoordinates(this.filterDataSourceByZoom(coordinates, 13))
    this.source19Collection.setCoordinates(this.filterDataSourceByZoom(coordinates, 19))
}

Helper.prototype.getCoordinatesByExtents = function(extents) {
    const internalExtents = extents || this.getSourceCollection().getExtentsByExtent(this.getViewExtent());
    return this.getSourceCollection().getCoordinatesByExtents(internalExtents)
}

Helper.prototype.addFeatures = function(features) {
    if (!window._stopUpdateSource_) {
        this.pointVectorSource.addFeatures(features)
    }
}

Helper.prototype.renderFeaturesByExtent = function(extents, reconciliation) {
    return new Promise(resolve => {
        const coordinates = this.getCoordinatesByExtents(extents);
        const features = []
        const taskHandle = (coord) => {
            const feature = new ol.Feature({ geometry: new ol.geom.Point(coord) });
            if (isDev) {
                feature.setStyle(this.pointStyle === this.pointStyle1 ? this.pointStyle2 : this.pointStyle1);
            }
            features.push(feature);
            return feature
        }

        if (!reconciliation) {
            for (let i = 0; i < coordinates.length - 1; i += 1) {
                taskHandle(coordinates[i])
            }
            resolve(features)
            return 
        }

        
        const reconciliationTaskNumber = this.reconciliationTaskNumber 
        const batchTaskHandle = (params) => {
            const internalFeatures = params.coordinates.map(taskHandle)
            features.push(...internalFeatures)
            this.addFeatures(internalFeatures)
        }
        for (let i = 0; i < coordinates.length - 1; i += reconciliationTaskNumber) {
            const coords = coordinates.slice(i, i + reconciliationTaskNumber);
            this.enqueue.enqueueTask(batchTaskHandle, {coordinates: coords}, () => {
                resolve(features)
            });
        }
    })
}

Helper.prototype.clearByExtents = function(extents) {
    const internalExtents = extents || this.getSourceCollection().getExtentsByExtent(this.getViewExtent());
    const features = internalExtents.reduce((acc, extent) => {
        const f = this.pointVectorSource.getFeaturesInExtent(extent);
        if (f.length) acc.push(...f)
        return acc
    }, [])
    features.forEach((feature) => this.pointVectorSource.removeFeature(feature))
    return features.length;
}

Helper.prototype.clear = function() {
    this.pointVectorSource.clear()
}

Helper.prototype.cacheFeaturesByExtents = function(features, extents) {
    const zoom = this.getZoom();
    const extent = this.getViewExtent();
    this.getSourceCollection().cacheFeaturesByExtents(features,extents)
}

Helper.prototype.log = function(params) {
    document.getElementById("log").innerHTML = `
        删除前${params.beforeClearFeatureLength}个, 
        删除后${params.afterClearFeatureLength}个, 
        删除了${params.clearedFeaturesLength}个, 
        增加了${params.addFeatureLength}个,
        一共${params.allFeatureLength}个
    ` 
}

Helper.prototype.getViewExtent = function() {
    return this.view.calculateExtent(this.map.getSize());
}


Helper.prototype.getSourceCollection = function() {
    const zoom = this.getZoom();
    if (zoom <= info[0].maxZoom) {
        return this.source1to6Collection;
    } 
    if (zoom <= info[1].maxZoom) {
        return this.source7to12Collection;
    } 
    if (zoom <= info[2].maxZoom) {
        return this.source13to18Collection;
    } 
    return this.source19Collection; 
}

Helper.prototype.getCacheFeaturesByExtents = function(extents) {
    return []
    // return this.getSourceCollection().getCacheFeaturesByExtents(extents)
}

Helper.prototype.createLayers = function() {
    for (let i = 0; i < layerConfigs.length; i++)  {
        const layer = this.layerFactory.getLayer(layerConfigs[i])
        this.map.addLayer(layer)
    }
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
          resolve(window.coordinates)
          script.remove()
        };
        script.src = url;
        document.head.appendChild(script);
    })
}

Helper.prototype.getPointStyle = function() {
    return new Promise((resolve) => {
        if (this.pointStyle) {
            this.pointStyle = this.pointStyle1 === this.pointStyle ? this.pointStyle2 : this.pointStyle1;
            resolve(this.pointStyle)
            return 
        }
        const pointImage = './images/point2.png' 
        const point1Image = './images/point1.png' 
        Promise.all([this.loadImage(pointImage), this.loadImage(point1Image)]).then(res => {
            this.pointStyle1 = new ol.style.Style({
                image: new ol.style.Icon({ img: res[0], imgSize: [2,2], })
            });
            this.pointStyle2 = new ol.style.Style({
                image: new ol.style.Icon({ img: res[1], imgSize: [2,2], })
            });
            this.pointStyle = this.pointStyle1
            this.pointVectorLayer.setStyle(this.pointStyle)
            resolve(this.pointStyle)
        })
    })
}

window.Helper = Helper;