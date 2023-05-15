import React , {useEffect, useState} from 'react'
import {Map, TileLayer} from 'maptalks'
import 'maptalks/dist/maptalks.css'

export const Maptalks = () => {

    useEffect(() => {
        const map = new Map('map', {
            center: [121.436, 31.228],
            zoom: 14,
            baseLayer: new TileLayer('base', {
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                subdomains: ['a', 'b', 'c', 'd'],
                attribution: '&copy; OpenStreetMap contributors'
            })
        })
    }, [])
    return <div id="map" style={{height: '50vh'}}></div> 
}