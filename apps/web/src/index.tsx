// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: EUPL-1.2

import { createRoot } from 'react-dom/client'
import { MLA } from 'react-mla'

import setupMockApi from './mock-setup'


setupMockApi()

const urlParams = new URLSearchParams(window.location.search);
  const configSrc = urlParams.get("config") ?? "config/default.json";
  const contextParam = urlParams.get("context") ?? undefined;
  const workflow = urlParams.get("workflow") ?? undefined;

createRoot(document.getElementById('root')!).render(
  <MLA configSrc={configSrc} context={contextParam} workflowId={workflow} />
)