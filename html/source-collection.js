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
    this.active = options.active;
    this.stride = options.stride;
    this.extent = options.extent;

    this.map = options.map;
    this.coordinates = null;
    this.collection = []
    this.gridVectorSource = new ol.source.Vector(); 
    this.gridVectorLayer = new ol.layer.Vector({source: this.gridVectorSource, zIndex: 999998})
    // this.gridVectorLayer.setStyle(getStyle())
    this.gridVectorLayer.setVisible(this.active)
    this.map.addLayer(this.gridVectorLayer);
    this.initCollection()
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
            this.collection.push({ extent: [x, y, _maxX, _maxY], needToBeUpdated: true, features: [], coordinates: [] })
        }
    }
    this.gridVectorSource.clear();
    this.gridVectorSource.addFeatures(features)
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
        for (let j = 0; j < coordinates.length; j++) {
            const coordinate = coordinates[j];
            if (ol.extent.containsCoordinate(item.extent, coordinate)) {
                item.coordinates.push(coordinate)
            }
        }
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