// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: CC0-1.0

import { useState } from 'react'
import { type IPhaseEvent } from '../../interfaces/data-models'
import { generateUUID } from '../../utils/utils'
import { DateTime } from 'luxon'
import { fixDate } from '../../utils/date'

interface Props {
  onChange: (event: IPhaseEvent) => void
  value?: IPhaseEvent
}

function PhaseCreator (props: Props) {
  const { onChange, value } = props
  const [newEvent, setEvent] = useState(value ?? {
    Id: generateUUID(),
    Description: '',
    Date: DateTime.now()
  } satisfies IPhaseEvent)

  function setDate (date: Date | null): void {
    if (date == null) {
      return
    }
    const update = {
      ...newEvent,
      Date: fixDate(date)!
    }
    setEvent(update)
    onChange(update)
  }

  function setText (text: string) {
    const update = {
      ...newEvent,
      Description: text
    }
    setEvent(update)
    onChange(update)
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-left p-6 pb-8 w-full">
      <span className="mb-1 text-sm font-medium text-gray-900">Description</span>
      <input autoFocus type="text" value={newEvent.Description} onChange={(e) => { setText(e.target.value) }} className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1"></input>

      <span className="mb-1 text-sm font-medium text-gray-900">Datum</span>
      <input required type="date" value={newEvent.Date.toISO()!.slice(0, 10)} onChange={(e) => { setDate(e.target.valueAsDate) }} className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1"></input>
    </div>
  )
}

export default PhaseCreator
