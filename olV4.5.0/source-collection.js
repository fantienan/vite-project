const isDev = true;
/**
 * @description 数据源工具类
 * @param {object} options
 * @param {map} map olMap
 * @param {number} stride 格子开度 
 */
function SourceCollection(options) {
    if (!options) throw 'SourceCollection没有传参数'
    if (!options.map) throw 'SourceCollection参数缺少map';
    if (!options.stride) throw 'SourceCollection参数缺少stride'; 
    if (!options.extent) throw 'SourceCollection参数缺少extent';
    if (!options.getStyle) throw 'SourceCollection参数缺少getStyle';
    if (!options.minZoom) throw 'SourceCollection参数缺少minZoom';
    if (!options.maxZoom) throw 'SourceCollection参数缺少maxZoom';
    if (!options.ratio) throw 'SourceCollection参数缺少ratio';
    this.getStyle = options.getStyle;
    this.active = options.active;
    this.stride = options.stride;
    this.extent = options.extent;
    this.minZoom = options.minZoom;
    this.maxZoom = options.maxZoom;
    this.map = options.map;
    this.ratio = options.ratio;
    this.coordinates = null;
    this.collection = []
    this.gridVectorSource = new ol.source.Vector(); 
    this.gridVectorLayer = new ol.layer.Vector({source: this.gridVectorSource, zIndex: 99998})
    this.gridVectorLayer.setVisible(this.active)
    // this.map.addLayer(this.gridVectorLayer);
    this.initCollection()
}

SourceCollection.prototype.getLayer = function(con) {
    const vectorSource = new ol.source.Vector(); 
    const vectorLayer = new ol.layer.Vector({source: vectorSource, zIndex: 99999, visible: false})
    return vectorLayer
}

SourceCollection.prototype.initCollection = function() {
    const [minX,minY,maxX, maxY] = this.extent;
    const stride = this.stride;
    const features = []
    for (let x = minX; x < maxX; x += stride) {
        let _maxX  = x + stride;
        _maxX =_maxX > maxX ? maxX + 1 : _maxX; 
        for (let y = minY; y < maxY; y += stride) {
            let _maxY = y + stride;
            _maxY =_maxY > maxY ? maxY + 1 : _maxY;
            const polygon = new ol.geom.Polygon([[
                [x, y],
                [_maxX, y],
                [_maxX, _maxY],
                [x, _maxY],
                [x, y]
            ]]);
            const feature = new ol.Feature({ geometry: polygon });
            features.push(feature);
            this.collection.push({ extent: [x, y, _maxX, _maxY], needToBeUpdated: true, features: [], coordinates: [], addMap: false, layer: this.getLayer() })
        }
    }
    this.gridVectorSource.clear();
    // this.gridVectorSource.addFeatures(features)
}

SourceCollection.prototype.log = function(featuresLength, extents) {
    return  `
        级别范围：${this.minZoom} - ${this.maxZoom}，
        抽稀后的数据：${this.coordinates.length}条，
        抽稀比例：${this.ratio * 100}%,
        格子开度：${this.stride}，
        格子数量：${this.collection.length}，
        格子范围：${JSON.stringify(this.extent)}，
        命中格子数量： ${extents.length}，
        命中格子内的要素数量： ${featuresLength}，
    `;
}

SourceCollection.prototype.setActive = function(active) {   
    this.active = active;
    this.gridVectorLayer.setVisible(active)
    if (isDev) {
        /**
         * 给格子添加标注，辅助开发
         */
        this.gridVectorSource.getFeatures().forEach(feature => {
            const extent = feature.getGeometry().getExtent()
            const res = this.collection.find(v => ol.extent.equals(v.extent, extent))

            feature.setStyle(
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.1)'
                    }),
                    text: new ol.style.Text({
                        text: `元素${res.coordinates.length}个/(${JSON.stringify(extent)})`,
                        font: "bold 20px serif",
                        fill: new ol.style.Fill({
                            color: '#fff'
                        }),
                        stroke: new ol.style.Stroke({color: '#000', width: 3}),
                    })
                })   
            )
        })
    }
}

SourceCollection.prototype.setCoordinates = function(coordinates) {
    this.coordinates = coordinates;
    for (let i = 0; i < this.collection.length; i++) {
        const item = this.collection[i];
        item.coordinates = []
        item.needToBeUpdated = false;
        item.features = []
        for (let j = 0; j < coordinates.length; j++) {
            const coordinate = coordinates[j];
            if (ol.extent.containsCoordinate(item.extent, coordinate)) {
                const feature = new ol.Feature({ geometry: new ol.geom.Point(coordinate) });
                item.coordinates.push(coordinate)
                item.features.push(feature)
            }
        }
        if (item.features.length) {
            item.layer.getSource().addFeatures(item.features)
        }
        item.layer.setStyle(this.getStyle())
        item.features = []
    }
}

/**
 * 判断两个四至是否相交，排除只有边重合的情况
 */
SourceCollection.prototype.intersectsExtent = function(extent1, extent2) {
    return !!ol.extent.getArea(ol.extent.getIntersection(extent1, extent2))
}

SourceCollection.prototype.getCoordinatesByExtents = function(extents) {  
    let internalExtents = [...extents];
    return this.collection.reduce((acc, cur) => {
        const index = internalExtents.findIndex(v => ol.extent.equals(cur.extent, v))
        if (index !== -1) {
            internalExtents.splice(index, 1);
            acc.push(...cur.coordinates)
        }
        return acc
    }, []);
}

SourceCollection.prototype.hideLayersByExtent = function(extent) {
    this.collection.forEach(v => {
        v.layer.setVisible(false)
    })
}

SourceCollection.prototype.triggerLayersByExtent = function(extent, visible) {
    return this.collection.reduce((acc, cur) => {
        cur.layer.setVisible(false)
        if (this.intersectsExtent(cur.extent, extent)) {
            if (!cur.addMap) {
                cur.addMap = true;
                this.map.addLayer(cur.layer)
            }

            cur.layer.setVisible(visible)
            acc.layers.push(cur.layer)
            acc.features.push(...cur.layer.getSource().getFeatures())
            acc.extents.push(cur.extent)
        }
        return acc
    }, {features: [], layers: [], extents: []})
}

SourceCollection.prototype.getExtentsByExtent = function(extent) {
    return this.collection.reduce((acc, cur) => {
        if (this.intersectsExtent(cur.extent, extent)) {
            acc.push(cur.extent)
        }
        return acc
    }, []);
}

SourceCollection.prototype.cacheFeaturesByExtents = function(features, extents) {
    let internalFeatures = [...features];
    this.collection.forEach(v => {
        const equal = extents.find(e => ol.extent.equals(v.extent, e));
        if (equal) {
            const info = internalFeatures.reduce((acc, cur) => {
                const coordinate = cur.getGeometry().getCoordinates();
                if (ol.extent.containsCoordinate(equal, coordinate)) {
                    acc.features.push(cur)
                } else {
                    acc.filteredFeatures.push(cur)
                }
                return acc
            }, {filteredFeatures: [], features: []})
            internalFeatures = info.filteredFeatures;
            v.features = info.features;
        }
    })
}

SourceCollection.prototype.getCacheFeaturesByExtents = function(extents) {
    let internalExtents = [...extents];
    return this.collection.reduce((acc,cur) => {
        const index = internalExtents.findIndex(v => ol.extent.equals(cur.extent, v))
        if (index !== -1) {
            internalExtents.splice(index, 1);
            acc.push(...cur.features)
        }
        return acc
    }, [])
}