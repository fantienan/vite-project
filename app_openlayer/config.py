#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2021/8/27 16:31
# @Author  : ZL
# @Site    : 
# @File    : config.py
# @Software: PyCharm
# @FUNCTION: 配置文件


pg_old_conninfos = {
    "host" : u'127.0.0.1',
    "port": 5432,
    "db" : u'lydb',
    "user" : u'postgres',
    "pwd" : u'789456'
}

pg_new_conninfos = {
    "host": u'127.0.0.1',
    "port": 5433,
    "db": u'lydb',
    "user": u'postgres',
    "pwd": u'789456'
}


compare_pg_schema = u"ldgx_13_hebei"
compare_pg_table = u"ldgx2020_ldgx2_p"
#
# pg_old_conninfos = {
#     "host" : u'192.168.1.121',
#     "port": 5532,
#     "db" : u'lydb',
#     "user" : u'postgres',
#     "pwd" : u'789456'
# }
#
# pg_new_conninfos = {
#     "host": u'192.168.1.121',
#     "port": 5533,
#     "db": u'lydb',
#     "user": u'postgres',
#     "pwd": u'789456'
# }
#
#
# compare_pg_schema = u"ldgx_13_hebei"
# compare_pg_table = u"ldgx2020_ldgx2_p"
