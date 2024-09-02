// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: CC0-1.0

import useAppStore from '../../../store/app-store'
import useMainStore from '../../../store/main-store'
import RibbonMenuButton from '../RibbonMenuButton'
import RibbonMenuSection from '../RibbonMenuSection'
import RibbonMenuDivider from '../RibbonMenuDivider'
import { type IEntity } from '../../../interfaces/data-models'
import configService from '../../../services/configurationService'
import { getId } from '../../../utils/utils'
import { produce } from 'immer'

function MapTabPanel () {
  const config = configService.getConfiguration()

  const selectedEntities = useMainStore((state) => state.selectedEntities())
  const entities = useMainStore((state) => state.entities)
  const update = useMainStore((state) => state.updateEntity)

  const setShowMap = useAppStore((state) => state.setShowMap)
  const showMap = useAppStore((state) => state.showMap)

  if (config.MapConfiguration == null) {
    return null
  }

  function set (ids: IEntity[], show: boolean) {
    const change = [] as IEntity[]

    for (const list of ids.map(e => entities[getId(e)])) {
      for (const e of list) {
        if (e.Coordinates && e.ShowOnMap !== show) {
          change.push(produce(e, draft => {
            draft.ShowOnMap = show
          }))
        }
      }
    }

    update(...change)
  }

  return <div className="m-flex m-text-center m-h-full m-p-1">
    <RibbonMenuSection title='Karta' >
      <RibbonMenuButton active={showMap} label='Kartläge' title="Visa kartan" onClick={() => { setShowMap(!showMap) }} iconName="public" />
    </RibbonMenuSection>
    <RibbonMenuDivider />
    <RibbonMenuSection title='Visning' >
      <RibbonMenuButton label='Lägg till' disabled={(selectedEntities.length === 0) || !selectedEntities.some(e => e.ShowOnMap === false)} onClick={() => { set(selectedEntities, true) }} iconName="add_location_alt_fill" />
      <RibbonMenuButton label='Dölj' disabled={(selectedEntities.length === 0) || !selectedEntities.some(e => e.ShowOnMap === true)} onClick={() => { set(selectedEntities, false) }} iconName="outlined_wrong_location" />
      <RibbonMenuButton label='Lägg till alla' onClick={() => { set(Object.values(entities).map(e => e[0]), true) }} iconName="add_location_alt_fill" />
      <RibbonMenuButton label='Dölj alla' onClick={() => { set(Object.values(entities).map(e => e[0]), false) }} iconName="wrong_location_fill" />
    </RibbonMenuSection>
    <RibbonMenuDivider />
  </div>
}
export default MapTabPanel
