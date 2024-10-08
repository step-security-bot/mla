// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: EUPL-1.2

interface Props {
  visible?: boolean
}

function RibbonMenuDivider (props: Props) {
  return props.visible !== false ? <div className="m-w-px m-border m-border-l-slate-300 -m-ml-px"></div> : null
}

export default RibbonMenuDivider
