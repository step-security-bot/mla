// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: EUPL-1.2

import configService from '../../services/configurationService'
import useWorkflowStore, { type IActionState } from '../../store/workflow-store'

import Icon from '../common/Icon'
import Spinner from '../common/Spinner'

function WorkflowProgress () {
  const workflowId = useWorkflowStore((state) => state.workflow)
  const actions = useWorkflowStore((state) => state.actions)

  if (workflowId === undefined) { return null }

  function action (action: IActionState) {
    const currentAction = configService.getWorkflow(workflowId!).Actions.find(x => x.Id === action.id)
    if (currentAction?.Name === undefined) {
      return null
    }

    return (
      <li key={action.id} className="m-m-10">
        <div className="m-flex m-items-center">
          <div className="m-h-8 m-w-8">
            {
              action.running
                ? <Spinner />
                : <Icon name={currentAction.Icon ?? 'check_circle'} color={action.error ? 'red' : action.completed ? 'green' : 'grey'} />
            }
          </div>
          <div className="m-ml-1 m-font-medium m-leading-tight">
            <p className="m-text-lg">{currentAction.Name}</p>
            <p>{currentAction.Description}</p>
            {action.error && <div className="m-text-red-700 m-relative" role="alert">
              <p>{action.error}</p>
            </div>}
          </div>

        </div>
      </li>
    )
  }

  return (
    <div>
      <ol className="relative text-gray-500 dark:text-gray-400">
        {
          actions.map(a => action(a))
        }
      </ol>
    </div>
  )
}

export default WorkflowProgress
