const crossOrigin = 'Anonymous';
const tileSize = 256;


function LayerFactory() {
    this.projection = null; 
}

LayerFactory.prototype.init = function(projection) {
    this.projection = projection;
}

LayerFactory.prototype.getLayer = function(con) {
    var layer;
    var type = con.c_type;
    var ogc = con.c_ogc;
    var source = con.c_source;
    if (type == 'TILE_SERVICE') {
        if (ogc === 'WMTS') {
            if (source == 'ZY3') {
                layer = this.getWmtsLayer(con);
            }
        } else if (ogc === 'XYZ') {
            if (source === 'TDT') {
                layer = this.getXyz4tdtLayer(con)
            }
        }
    }
    return layer
}

LayerFactory.prototype.stringify = function(obj) {
    return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
}

LayerFactory.prototype.assemblyUrl = function(con) {
    return con.c_url.trim() + con.c_path.trim();
}

LayerFactory.prototype.getWmtsLayer = function(con) {
    var layer;
    try {
        var rs = this.getResolutions(con.d_firstDpi);
        var params = {};
        if (con.c_parameter) {
            params = JSON.parse(con.c_parameter.replace(/'/g, '"').replace(/\\"/g, '"').replace(/\\'/g, '"'));
        }
        var dimensions = Object.assign({}, params);
        delete dimensions.layer;
        delete dimensions.matrixSet;
        delete dimensions.style;
        delete dimensions.format;
        delete dimensions.version;
        delete dimensions.mapId;
        layer = new ol.layer.Tile({
            zIndex: con.i_zIndex ? con.i_zIndex : 0,
            visible: con.i_visible == 1,
            opacity: con.d_opacity,
            maxResolution: rs['resolutions'][con.i_minLevel],
            minResolution: rs['resolutions'][con.i_maxLevel],
            source: new ol.source.WMTS({
                url: this.assemblyUrl(con),
                projection: this.projection,
                layer: params.layer,
                matrixSet: params.matrixSet,
                style: params.style || 'default',
                format: params.format || 'image/jpeg',
                version: params.version || '1.0.0',
                dimensions: dimensions,
                crossOrigin: crossOrigin,
                tileGrid: new ol.tilegrid.WMTS({
                    extent: con.c_extent ? JSON.parse(con.c_extent) : null,
                    origin: JSON.parse(con.c_origin),
                    resolutions: rs['resolutions'],
                    matrixIds: rs['matrixIds'],
                }),
            }),
        });
    } catch (error) {
        console.error(error, con);
    } finally {
        return layer;
    }
}

LayerFactory.prototype.getXyz4tdtLayer = function(con) {
    var layer;
    try {
        var rs = this.getResolutions(con.d_firstDpi);
        layer = new ol.layer.Tile({
            zIndex: con.i_zIndex ? con.i_zIndex : 0,
            visible: con.i_visible == 1,
            opacity: con.d_opacity,
            maxResolution: rs['resolutions'][con.i_minLevel],
            minResolution: rs['resolutions'][con.i_maxLevel],
            source: new ol.source.XYZ({
                projection: projection,
                crossOrigin: crossOrigin,
                tileUrlFunction:  (tileCoord) => {
                    var url = this.assemblyUrl(con);
                    var z = tileCoord[0] + 1;
                    var x = tileCoord[1];
                    var y = -tileCoord[2] - 1;
                    var serverId = Math.round(Math.random() * 7);
                    url = url.replace(/\{[0-9]-[0-9]\}/, serverId);
                    return url.replace('{z}', z.toString()).replace('{y}', y.toString()).replace('{x}', x.toString());
                },
                tileGrid: new ol.tilegrid.TileGrid({
                    extent: con.c_extent ? JSON.parse(con.c_extent) : null,
                    origin: JSON.parse(con.c_origin),
                    resolutions: rs['resolutions'],
                    tileSize: con.c_tileSize || tileSize,
                }),
            }),
        });
    } catch (error) {
        console.error(error, con);
    } finally {
        return layer;
    }
};

LayerFactory.prototype.getResolutions = function(firstDpi) {
    const resolution = firstDpi || 360 / 256;
    const resolutions = [];
    const matrixIds = [];
    for (let z = 0; z <= maxZoom; z += 1) {
        resolutions[z] = resolution / 2 ** z;
        matrixIds[z] = z.toString();
    }
    return {
        resolutions,
        matrixIds,
    };
}

window.LayerFactory = LayerFactory;