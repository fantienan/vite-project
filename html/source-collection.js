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
    this.active = options.active;
    this.extent = [70, 15, 140, 55];
    this.stride = options.stride;
    this.map = options.map;
    this.geoJson = null;
    this.collection = []
    this.gridVectorSource = new ol.source.Vector(); 
    this.gridVectorLayer = new ol.layer.Vector({source: this.gridVectorSource, zIndex: 999998})
    this.gridVectorLayer.setStyle(
        new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              width: 1
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.1)'
            })
        })
    )
    this.gridVectorLayer.setVisible(this.active)
    this.map.addLayer(this.gridVectorLayer);
    this.initCollection()
}

SourceCollection.prototype.setGeoJson = function(geoJson, features) {
    this.geoJson = {...geoJson, features: []};
    for (let i = 0; i < this.collection.length; i++) {
        const item = this.collection[i];
        item.geoJson = {...geoJson, features: []};
        for (let j = 0; j < features.length; j++) {
            const feature = features[j];
            if (ol.extent.containsCoordinate(item.extent, feature.geometry.coordinates)) {
                item.geoJson.features.push(feature)
                this.geoJson.features.push(feature)
            }
        }
    }
}

SourceCollection.prototype.initCollection = function() {
    const [minX,minY,maxX, maxY] = this.extent;
    const stride = this.stride;
    const features = []
    for (let x = minX; x <= maxX - stride; x += stride) {
        for (let y = minY; y <= maxY - stride; y += stride) {
            const polygon = new ol.geom.Polygon([[
                [x, y],
                [x + stride, y],
                [x + stride, y + stride],
                [x, y + stride],
                [x, y]
            ]]);
            const feature = new ol.Feature({ geometry: polygon,  });
            feature.setProperties({row: y, col: x})
            features.push(feature);
            this.collection.push({extent: [x, y, x + stride, y + stride], features: [],geoJson: null})
        }
    }
    this.gridVectorSource.clear();
    this.gridVectorSource.addFeatures(features)

}

SourceCollection.prototype.save = function(features, extent) {
    if (ol.extent.equals(extent, this.extent)) {
        return this.collection;
    }
    const data = this.collection.filter(v => ol.extent.intersects(extent, v.extent))
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const coordinate = feature.getGeometry().getCoordinates();
        const item = data.find(v => ol.extent.containsCoordinate(v.extent, coordinate))
        if (item) {
            item.features.push(feature)
        }
    }
    debugger
}

SourceCollection.prototype.getSourceByExtent = function(extent) {
    return this.collection.reduce((acc, cur) => {
        if (ol.extent.intersects(cur.extent, extent)) acc.push(...cur.features)
        return acc
    }, []);
}

SourceCollection.prototype.getSourceByCoordinate = function(coordinate) {
    return this.collection.find(v => ol.extent.containsCoordinate(v.extent, coordinate))
}

SourceCollection.prototype.setActive = function(active) {   
    this.active = active;
    this.gridVectorLayer.setVisible(active)
}

SourceCollection.prototype.getGeoJsonByExtent = function(extent) {  
    return this.collection.reduce((acc, cur) => {
        if (ol.extent.intersects(cur.extent, extent)) acc.features.push(...cur.geoJson.features)
        return acc
    }, {type: "FeatureCollection", features: []});
}