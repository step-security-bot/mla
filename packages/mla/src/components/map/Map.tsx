// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: CC0-1.0

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import configService from '../../services/configurationService'
import useMainStore from '../../store/main-store'
import useAppStore from '../../store/app-store'
import { LatLng, type PM } from 'leaflet'
import * as L from 'leaflet'

import './Map.scss'
import '@geoman-io/leaflet-geoman-free'
import './fullscreen/Control.FullScreen'

import { produce } from 'immer'
import EntityMarker from './elements/EntityMarker'
import { getId } from '../../utils/utils'
import { IEntity } from '../../interfaces/data-models'
import { TileConfiguration, WmsConfiguration } from '../../interfaces/configuration/map-configuration'

interface Props {
  className?: string
}

function Map(props: Props) {
  const showContextMenu = useAppStore(state => state.showContextMenu)
  const showMap = useAppStore(state => state.showMap)
  const setSelectedGeoFeature = useAppStore(state => state.setSelectedGeoFeature)

  const placeEntityId = useAppStore(state => state.placeEntityId)
  const setPlaceEntityId = useAppStore(state => state.setPlaceEntityId)
  const getEntity = useMainStore(state => state.getCurrentEntity)
  const getEntities = useMainStore(state => state.getEntityHistory)

  const setSelected = useMainStore(state => state.setSelected)
  const setDate = useMainStore(state => state.setDate)
  const entities = useMainStore(state => state.entities)
  const update = useMainStore(state => state.updateEntity)

  const [map, setMap] = useState<L.Map | null>(null)

  function onSelect(e: IEntity) {
    setSelected([getId(e)])
    if (e.DateFrom) {
      setDate(e.DateFrom)
    }
  }

  const mapRef = useCallback((node: HTMLDivElement | null) => {
    if (node != null) {
      const center = new LatLng(57.697909930605185, 12.006280860668483)
      const zoom = 13

      const mapOptions = {
        maxBounds: [[-90, -180], [90, 180]],
        center,
        zoom,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: 'topleft'
        }
      } as any

      try {
        const config = configService.getConfiguration().MapConfiguration!
        const lMap = new L.Map(node, mapOptions)

        const layerControl = L.control.layers().addTo(lMap)

        const layers = [] as L.TileLayer[]
        if (config.MapLayers) {
          (config.MapLayers as TileConfiguration[]).forEach((layer) => {
            const mapLayer = L.tileLayer(layer.Url, {
              attribution: layer.Attribution,
              maxZoom: layer.MaxZoom,
              minZoom: layer.MinZoom,
              tms: layer.TMS, 
              subdomains: layer.SubDomains ?? []
            })

            layers.push(mapLayer)
            layerControl.addBaseLayer(mapLayer, layer.Name)
          })
        }

        if (config.WmsMapLayers) {
          (config.WmsMapLayers as WmsConfiguration[]).forEach((layer, index) => {
            const mapLayer = L.tileLayer.wms(layer.Url, {
              layers: layer.Layers,
              format: layer.Format,
              transparent: layer.Transparent,
              version: layer.Version,
              attribution: layer.Attribution
            })

            layers.push(mapLayer)
            layerControl.addBaseLayer(mapLayer, layer.Name)
          })
        }

        if (layers.length == 0) {
          console.error(config)
          throw new Error("No map layers configured")
        }

        layers[0].addTo(lMap)

        if (config.Layers != null) {
          (config.Layers as WmsConfiguration[]).forEach((map) => {
            const overlay = L.tileLayer.wms(map.Url, {
              layers: map.Layers,
              format: map.Format,
              transparent: map.Transparent,
              version: map.Version,
              attribution: map.Attribution
            })
            layerControl.addOverlay(overlay, map.Name)
          })
        }


        lMap.pm.addControls({
          position: 'topright',
          drawCircleMarker: false,
          drawRectangle: false,
          drawMarker: false,
          drawText: false,
          drawPolyline: false,
          editMode: false,
          rotateMode: false,
          dragMode: false,
          cutPolygon: false
        })

        setMap(lMap)
      } catch (e) {
        console.debug(e)
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (map == null) {
      return
    }

    function polygonCreated(e: { shape: PM.SUPPORTED_SHAPES, layer: L.Layer }) {
      switch (e.shape) {
        case 'Circle': e.layer.on('contextmenu', (ev) => {
          const circle = ev.target as L.Circle
          const selected = { Point: { lat: ev.latlng.lat, lng: ev.latlng.lng }, Circle: { Position: { lat: circle.getLatLng().lat, lng: circle.getLatLng().lng }, Radius: circle.getRadius() }, Bounds: circle.getBounds() }
          setSelectedGeoFeature(selected)
          showContextMenu(ev.originalEvent.clientX, ev.originalEvent.clientY)
        }); break
        case 'Polygon': e.layer.on('contextmenu', (ev) => {
          const poly = ev.target as L.Polygon
          const selected = { Point: { lat: ev.latlng.lat, lng: ev.latlng.lng }, Polygon: (poly.getLatLngs() as L.LatLng[]), Bounds: poly.getBounds() }
          setSelectedGeoFeature(selected)
          showContextMenu(ev.originalEvent.clientX, ev.originalEvent.clientY)
        }); break
      }
    }

    map.on('contextmenu', (e) => {
      const container = (map as any)._container

      // Click was on another layer / feature
      if (container._leaflet_id !== (e.originalEvent.target as any)?._leaflet_id) {
        return
      }

      e.originalEvent.preventDefault()
      setSelectedGeoFeature({ Point: { lat: e.latlng.wrap().lat, lng: e.latlng.wrap().lng } })
      showContextMenu(e.originalEvent.clientX, e.originalEvent.clientY)
    })

    map.on('pm:create', (e) => {
      polygonCreated(e)
    })

    map.pm.setLang('sv')
  }, [map, setSelectedGeoFeature, showContextMenu])

  const mapEntities = useMemo(() => {
    const showOnMap = [] as string[]

    for (const ent of Object.keys(entities)) {
      const entity = entities[ent].find(e => e.Coordinates != null && e.ShowOnMap)
      if (entity != null) {
        showOnMap.push(ent)
      }
    }
    return showOnMap
  }, [entities])

  useEffect(() => {
    if (showMap && map) {
      map.invalidateSize()
    }
  }, [showMap, map])

  useEffect(() => {
    const setPosition = (ev: any) => {
      if (placeEntityId != null) {
        const ent = getEntity(placeEntityId)
        if (ent) {
          const updateEntity = produce(ent, draft => {
            draft.Coordinates = { lat: ev.latlng.wrap().lat, lng: ev.latlng.wrap().lng }
            draft.ShowOnMap = true
          })
          update(updateEntity)
          setPlaceEntityId()
        }
      }
    }

    if (map && placeEntityId) {
      map.on('click', setPosition)
      return () => {
        map.off('click', setPosition)
      }
    }

    return
  }, [map, placeEntityId, update, getEntities, setPlaceEntityId, getEntity])

  if (configService.getConfiguration().MapConfiguration == null) {
    return null
  }

  return (
    <div className={props.className + ' bg-white'}>
      <div className='h-full w-full relative'>
        {placeEntityId && <div className='absolute h-full w-full z-30 opacity-75 pointer-events-none'>
          <p className='bg-white mx-20 mt-5 text-center rounded-md'>
            Klicka på kartan för att placera {getEntity(placeEntityId)!.LabelShort}
          </p>
        </div>}

        <div ref={mapRef} className='h-full w-full z-20' ></div>
      </div>
      {map && showMap && mapEntities.map(s =>
        <EntityMarker key={s} entityId={s} map={map} click={(e) => { onSelect(e) }}></EntityMarker>
      )}
    </div>)
}

export default Map
