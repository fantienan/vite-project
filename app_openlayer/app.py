#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2021/8/26 17:12
# @Author  : ZL
# @Site    : 
# @File    : app.py
# @Software: PyCharm
# @FUNCTION:

from psycopg2 import pool
from threading import Semaphore
import json, time
from flask import Flask, render_template, request, make_response
# Flask-WTF
from flask_wtf.csrf import CsrfProtect
# from osgeo import ogr
from config import *


class ReallyThreadedConnectionPool(pool.ThreadedConnectionPool):
    """
    面向多线程的连接池，提高地图瓦片类高并发场景的响应。
    """

    def __init__(self, minconn, maxconn, *args, **kwargs):
        self._semaphore = Semaphore(maxconn)
        super().__init__(minconn, maxconn, *args, **kwargs)

    def getconn(self, *args, **kwargs):
        self._semaphore.acquire()
        return super().getconn(*args, **kwargs)

    def putconn(self, *args, **kwargs):
        super().putconn(*args, **kwargs)
        self._semaphore.release()
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #


app = Flask(__name__)
app.config["SECRET_KEY"] = "12345678"
CsrfProtect(app)

WORLD_BOUNDS = [-180, -90, 180, 90]
WORLD_SRID = 4490

new_connect_pool = None
old_connect_pool = None

TILE_DRAW_SIZE = 512

@app.route('/')
def index_page():
    return render_template('index.html')



strSqlFMT_ldgx = u"SELECT ST_AsMVT(tile, '{0}', {1}, 'geom') AS tile FROM ( " \
             u"SELECT w.pk_uid, ST_AsMVTGeom(w.geom, Box2D(ST_MakeEnvelope({2}, {3}, {4}, {5}, {6})), {1}, 0, false) AS geom {8} FROM " \
             u"{7}.{0} w WHERE ST_Intersects(geom, ST_MakeEnvelope({2}, {3}, {4}, {5}, {6}))) tile" \
             u" WHERE tile.geom IS NOT NULL;".format(compare_pg_table, u"{4}", u'{0}', u'{1}', u'{2}', u'{3}',
                                                     WORLD_SRID, compare_pg_schema, ", xiao_ban, mian_ji, you_shi_sz, po_xiang, di_lei")
# strSqlFMT_ldgx = u"SELECT ST_AsMVT(tile, '{0}', {1}, 'geom' {8}) AS tile FROM ( " \
#              u"SELECT w.pk_uid, ST_AsMVTGeom(w.geom, Box2D(ST_MakeEnvelope({2}, {3}, {4}, {5}, {6})), {1}, 0, true) AS geom FROM " \
#              u"{7}.{0} w WHERE ST_Intersects(geom, ST_MakeEnvelope({2}, {3}, {4}, {5}, {6}))) tile" \
#              u" WHERE tile.geom IS NOT NULL;".format(compare_pg_table, u"{4}", u'{0}', u'{1}', u'{2}', u'{3}',
#                                                      WORLD_SRID, compare_pg_schema, u"")

strSqlFMT_xian = u"SELECT ST_AsMVT(tile, '{0}', {1}, 'geom' {8}) AS tile FROM ( " \
             u"SELECT w.pk_uid, ST_AsMVTGeom(w.geom, Box2D(ST_MakeEnvelope({2}, {3}, {4}, {5}, {6})), {1}, 0, false) AS geom FROM " \
             u"{7}.{0} w WHERE ST_Intersects(geom, ST_MakeEnvelope({2}, {3}, {4}, {5}, {6}))) tile" \
             u" WHERE tile.geom IS NOT NULL;".format("xian", u"{4}", u'{0}', u'{1}', u'{2}', u'{3}',
                                                     WORLD_SRID, "zq", u"")


strSqlFMT_zq_line = u"SELECT ST_AsMVT(tile, '{0}', {1}, 'geom' {8}) AS tile FROM ( " \
             u"SELECT w.pk_uid, ST_AsMVTGeom(w.geom, Box2D(ST_MakeEnvelope({2}, {3}, {4}, {5}, {6})), {1}, 0, false) AS geom FROM " \
             u"{7}.{0} w WHERE ST_Intersects(geom, ST_MakeEnvelope({2}, {3}, {4}, {5}, {6}))) tile" \
             u" WHERE tile.geom IS NOT NULL".format("{5}", u"{4}", u'{0}', u'{1}', u'{2}', u'{3}',
                                                     WORLD_SRID, "quanguo_zq_line", u"")


def poll_query(connect_pool, query: str):
    pg_connection = connect_pool.getconn()
    pg_cursor = pg_connection.cursor()
    pg_cursor.execute(query)
    record = pg_cursor.fetchone()
    pg_connection.commit()
    pg_cursor.close()
    connect_pool.putconn(pg_connection)
    if record is not None:
        return record[0]
    return None

def queryBound(level, col, row):
    global new_connect_pool
    # 获取瓦片范围
    strSql = u"select * from st_astext(ST_TileEnvelope({5}, {6}, {7}, ST_MakeEnvelope({0}, {1}, {2}, {3}, {4})));".format(
        WORLD_BOUNDS[0], WORLD_BOUNDS[1], WORLD_BOUNDS[2], WORLD_BOUNDS[3], WORLD_SRID, level, col, row)
    ret = poll_query(new_connect_pool, strSql)
    if ret is None:
        return None

    strTemp = ret.lstrip('POLYGON((')
    strTemp = strTemp.rstrip('))')
    strArrays = strTemp.split(',')
    points = []
    for item in strArrays:
        strA = item.split(' ')
        points.append(strA[0])
        points.append(strA[1])
        continue
    tileBound = [points[0], points[1], points[4], points[5]]
    return tileBound

def getDPI(nLevel):
    dpi_zero = 360.0 / 512.0
    dpi_cur = dpi_zero/pow(2, nLevel)
    return dpi_cur

def getBound(level, col, row):
    # tileBoundFromDb = queryBound(level, col, row)

    dpi_cur = getDPI(level)

    left = 0
    right = 0
    top = 0.0
    bottom = 0.0

    top = WORLD_BOUNDS[3] - (row * TILE_DRAW_SIZE * dpi_cur)
    bottom = top - TILE_DRAW_SIZE * dpi_cur
    left = col * TILE_DRAW_SIZE * dpi_cur + WORLD_BOUNDS[0]
    right = left + TILE_DRAW_SIZE * dpi_cur


    tileBound = [left, bottom, right, top]
    return tileBound

IN_THREAD_NUM = 0

def GetMvt(connect_pool, table, tilesize, level, col, row):
    try:
        # if int(level) < 6:
        #     # print(u"过滤访问瓦片 level:{0} col:{1} row: {2}".format(level, col, row))
        #     return None

        global IN_THREAD_NUM
        IN_THREAD_NUM += 1

        print(u"访问瓦片 level:{0} col:{1} row: {2}".format(level, col, row))
        time_begin = time.time()

        tileBound = getBound(level, col, row)
        if tileBound is None:
            print("tileBound is none!")
            return None

        strSql = ""
        if "ldgx" == table:
            strSql = strSqlFMT_ldgx.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize)
        elif "xian" == table:
            strSql = strSqlFMT_xian.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize)
        elif "guo_sheng_line" == table:
            strSql_guo = strSqlFMT_zq_line.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize, "china_line")
            strSql_sheng = strSqlFMT_zq_line.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize,
                                                  "sheng_line")
            strSql = u"select (({0}) || ({1}))".format(strSql_guo, strSql_sheng)
        elif "shi_xian_line" == table:
            strSql_guo = strSqlFMT_zq_line.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize,
                                                  "shi_line")
            strSql_sheng = strSqlFMT_zq_line.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize,
                                                    "xian_line")
            strSql = u"select (({0}) || ({1}))".format(strSql_guo, strSql_sheng)
        elif "country" == table:
            strSql = strSqlFMT_zq_line.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize,
                                                    "country")
        elif "lakes" == table:
            strSql = strSqlFMT_zq_line.format(tileBound[0], tileBound[1], tileBound[2], tileBound[3], tilesize,
                                                    "lakes")
        else:
            pass

        mvt_tile_data = poll_query(connect_pool, strSql)
        if mvt_tile_data is None:
            print("tile data is none!")
            return None
        time_end = time.time()
        print(u"瓦片 level:{0} col:{1} row: {2} 查询时间：{3}秒".format(level, col, row, time_end-time_begin))


        IN_THREAD_NUM -= 1
        if IN_THREAD_NUM > 4:
            print("并发瓦片查询数目:{0}".format(IN_THREAD_NUM))

        # return mvt_tile_data.tobytes()
        return mvt_tile_data.tobytes()
    except Exception as ex:
        print(ex)
        return None


# @app.route('/GetOldMVTForMapboxGl/<int:level>/<int:col>/<int:row>.mvt', methods=['GET'])
# def GetOldMVTForMapboxGl(level, col, row):
#     global old_connect_pool
#     return GetMvt(old_connect_pool, level, col, row)

@app.route('/GetNewMVTForMapboxGl/<table>/<int:tilesize>/<int:level>/<int:col>/<int:row>.mvt', methods=['GET'])
def GetNewMVTForMapboxGl(table, tilesize, level, col, row):
    global new_connect_pool
    tile = GetMvt(new_connect_pool, table, tilesize, level, col, row)
    response = make_response(tile)
    response.headers['Content-Type'] = "application/x-protobuf"
    response.headers['Access-Control-Allow-Origin'] = "*"
    response.headers['Access-Control-Allow-Methods'] = "POST"
    response.headers['Access-Control-Allow-Headers'] = "x-requested-with,content-type"

    return response


def getConnectStr(pg_conninfos):
    return "dbname={0} user={1} password={2} host={3} port={4}".format(
        pg_conninfos["db"], pg_conninfos["user"], pg_conninfos["pwd"], pg_conninfos["host"], pg_conninfos["port"])


def main():
    global new_connect_pool, old_connect_pool

    try:
        CONNECTION_STR = getConnectStr(pg_old_conninfos)
        old_connect_pool = ReallyThreadedConnectionPool(10, 20, CONNECTION_STR)
    except Exception as ex:
        print("旧版PG连接失败")

    try:
        CONNECTION_STR = getConnectStr(pg_new_conninfos)
        new_connect_pool = ReallyThreadedConnectionPool(10, 20, CONNECTION_STR)
    except Exception as ex:
        print("新版PG连接失败")

    app.run(host='0.0.0.0', port=5001, threaded=True)
    return

if __name__ == '__main__':
    main()
    pass


# firewall-cmd --permanent --add-port=5001/tcp
# firewall-cmd --reload

# nohup python3 app.py > app.log 2>&1 &

# 查找进程
# pidof python3