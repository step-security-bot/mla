// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: CC0-1.0

import iconService from '../../services/iconService'

interface IconProps {
  name?: string
  className?: string
  color?: string
}

function Icon (props: IconProps) {
  const svg = iconService.getSVG(props.name ?? 'warning')
  return <div style={{ color: props.color }} className={'fill-current mla-icon ' + props.className} dangerouslySetInnerHTML={{ __html: svg }} />
}

export default Icon
