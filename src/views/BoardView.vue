<script setup lang="ts">
import BoardList from '@/components/BoardList.vue'
import { ref, computed, provide, watch, toRaw } from 'vue'
import {
  useMouse,
  useMousePressed,
  watchDeep,
  useTemplateRefsList,
  useElementBounding,
  refAutoReset
} from '@vueuse/core'
import type { MousePosition } from '@/types/MousePosition'
import type { ListBoundaries } from '@/types/ListBoundaries'
import type { List } from '@/api/List'
import type { Task } from '@/api/Task'
import { useDragAndDropStore } from '@/stores/dragAndDropStore'

const lists = ref<List[]>([
  {
    id: 1,
    name: 'Backlog',
    next_id: 2,
    prev_id: undefined
  },
  {
    id: 2,
    name: 'TODO',
    next_id: 3,
    prev_id: 1
  },
  {
    id: 3,
    name: 'In Progress',
    next_id: 4,
    prev_id: 2
  },
  {
    id: 4,
    name: 'In Review',
    next_id: 5,
    prev_id: 3
  },
  {
    id: 5,
    name: 'Done',
    next_id: undefined,
    prev_id: 4
  }
])

const tasks = ref<Task[]>([
  {
    id: 1,
    title: 'Tests for all API methods',
    list_id: 1,
    next_id: 2,
    prev_id: 11
  },
  {
    id: 2,
    title: 'CI/CD for task-tracker',
    list_id: 1,
    next_id: 3,
    prev_id: 1
  },
  {
    id: 3,
    title: 'OpenAPI documentation for all API endpoints',
    list_id: 1,
    next_id: 4,
    prev_id: 2
  },
  {
    id: 4,
    title: 'Kotlindoc for all methods inside API',
    list_id: 1,
    next_id: 5,
    prev_id: 3
  },
  {
    id: 5,
    title: 'Flow charts of every opration in excalidraw',
    list_id: 1,
    next_id: 6,
    prev_id: 4
  },
  {
    id: 6,
    title: 'README for every project repository',
    list_id: 1,
    next_id: 7,
    prev_id: 5
  },
  {
    id: 7,
    title: 'Grafana monitoring?',
    list_id: 1,
    next_id: 8,
    prev_id: 6
  },
  {
    id: 8,
    title: 'Deploy with docker swarm',
    list_id: 1,
    next_id: 13,
    prev_id: 7
  },
  {
    id: 9,
    title: 'Drag-n-drop for tasks between lists',
    list_id: 5,
    next_id: 12,
    prev_id: undefined
  },
  {
    id: 10,
    title: 'Custom lists creation button',
    list_id: 2,
    next_id: 11,
    prev_id: undefined
  },
  {
    id: 11,
    title: 'Lists drag-n-drop',
    list_id: 2,
    next_id: undefined,
    prev_id: 10
  },
  {
    id: 12,
    title: 'Respect position of the dropped task in a list',
    list_id: 5,
    next_id: undefined,
    prev_id: 10
  },
  {
    id: 13,
    title:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique animi, quas delectus, ullam tenetur quae nesciunt laudantium odit deleniti quaerat sit laboriosam suscipit cupiditate saepe quod voluptas, facilis dolor nostrum.',
    list_id: 1,
    next_id: 14,
    prev_id: 8
  },
  {
    id: 14,
    title:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique animi, quas delectus, ullam tenetur quae nesciunt laudantium odit deleniti quaerat sit laboriosam suscipit cupiditate saepe quod voluptas, facilis dolor nostrum.',
    list_id: 1,
    next_id: undefined,
    prev_id: 13
  }
])

const listsCopy = ref(lists.value)

const { x, y } = useMouse()
const { pressed } = useMousePressed()

const mousePosition = computed<MousePosition>(() => {
  return {
    x: x.value,
    y: y.value
  }
})

provide('mousePosition', mousePosition)
provide('mousePressed', pressed)

const dragAndDropStore = useDragAndDropStore()

const listElements = useTemplateRefsList<HTMLDivElement>()

const listBoundaries = ref<ListBoundaries[]>()

const tasksForList = ref<Map<number, Task[]>>(new Map<number, Task[]>())
const sortedLists = ref<List[]>(sortLists(lists.value))

const draggingList = computed(() => dragAndDropStore.getDraggingList)
const isDraggingList = computed(() => draggingList.value !== undefined)

const listBeforeId = refAutoReset<number | undefined>(undefined, 100)
const listAfterId = refAutoReset<number | undefined>(undefined, 100)

watch(
  () => tasks.value,
  (tasks) => {
    lists.value.forEach((list) => {
      const listTasks = tasks.filter((task) => task.list_id === list.id)
      tasksForList.value.set(list.id, listTasks)
    })
  },
  { immediate: true, deep: true }
)

watchDeep(
  () => lists.value,
  (lists) => {
    sortedLists.value = sortLists(lists)
    listsCopy.value = lists
  }
)

watchDeep(
  () => listElements.value,
  (listElements) => (listBoundaries.value = calculateListsBoundaries(listElements))
)

watch(
  () => mousePosition.value,
  (mousePosition) => {
    if (!isDraggingList.value || listBoundaries.value === undefined) {
      return
    }

    for (const listBoundary of listBoundaries.value) {
      if (listBoundary.listId === draggingList.value?.id) {
        continue
      }

      const left = listBoundary.left
      const thirdQuarter = thirdQuarterOf(listBoundary)
      const right = listBoundary.right

      if (mousePosition.x > left && mousePosition.x < thirdQuarter) {
        listBeforeId.value = listBoundary.listId
        return
      }
      if (mousePosition.x > thirdQuarter && mousePosition.x < right) {
        listAfterId.value = listBoundary.listId
        return
      }
    }
  }
)

watch([listBeforeId, listAfterId], ([listBeforeId, listAfterId]) => {
  atMouseBefore(listBeforeId)
  atMouseAfter(listAfterId)
})

function thirdQuarterOf(list: ListBoundaries): number {
  const width = Math.abs(list.right - list.left)
  const middle = list.left + width * 0.75

  return middle
}

function calculateListsBoundaries(listElements: HTMLDivElement[]): ListBoundaries[] {
  return listElements.map((listElement) => {
    const listId = Number(listElement.dataset.id)

    const { top, bottom, right, left } = useElementBounding(listElement)

    return {
      listId: listId,
      top: top.value,
      bot: bottom.value,
      right: right.value,
      left: left.value
    }
  })
}

function reorderTasks(reorderedTasks: Task[]): void {
  tasks.value.forEach((task) => {
    const reorderedTask = reorderedTasks.find((reorderedTask) => reorderedTask.id == task.id)

    if (reorderedTask !== undefined) {
      task.next_id = reorderedTask.next_id
      task.prev_id = reorderedTask.prev_id
      task.list_id = reorderedTask.list_id
    }
  })
}

function sortLists(lists: List[]): List[] {
  const listsMap = new Map(lists.map((list) => [list.id, list]))

  const firstList = lists.find((list) => {
    if (list.prev_id === undefined) {
      return list
    }
    if (listsMap.get(list.prev_id) === undefined) {
      return list
    }
  })

  let currentList = firstList

  const sortedLists = []

  while (currentList !== undefined) {
    sortedLists.push(currentList)
    currentList = currentList.next_id ? listsMap.get(currentList.next_id) : undefined
  }

  return sortedLists
}

function findList(listId: number | undefined): List | undefined {
  if (listId === undefined) {
    return undefined
  }

  return listsCopy.value.find((list) => list.id === listId)
}

function atMouseBefore(taskId: number | undefined): void {
  if (taskId === undefined) {
    return
  }

  const targetNextTask = findList(taskId)
  const targetPrevTask = findList(targetNextTask?.prev_id)

  reorderLists(targetNextTask, targetPrevTask)
}

function atMouseAfter(taskId: number | undefined): void {
  if (taskId === undefined) {
    return
  }

  const targetPrevTask = findList(taskId)
  const targetNextTask = findList(targetPrevTask?.next_id)

  reorderLists(targetNextTask, targetPrevTask)
}

function reorderLists(targetNextList: List | undefined, targetPrevList: List | undefined): void {
  if (!isDraggingList.value) {
    return
  }
  const reorderedLists = new Set<List>()

  const targetList = draggingList.value!

  const originPrevList = findList(targetList.prev_id)
  const originNextList = findList(targetList.next_id)

  // Stops dragging list from being placed right next to its original position
  if (targetNextList?.id === targetList.id) {
    return
  }
  if (targetPrevList?.id === targetList.id) {
    return
  }

  // Updating links of lists from which the dragged list was removed
  if (originPrevList !== undefined) {
    originPrevList.next_id = targetList.next_id
    reorderedLists.add(originPrevList)
  }
  if (originNextList !== undefined) {
    originNextList.prev_id = targetList.prev_id
    reorderedLists.add(originNextList)
  }

  // Updating links of lists where the dragged list is inserted
  if (targetNextList !== undefined) {
    targetNextList.prev_id = targetList.id
    reorderedLists.add(targetNextList)
  }
  if (targetPrevList !== undefined) {
    targetPrevList.next_id = targetList.id
    reorderedLists.add(targetPrevList)
  }

  targetList.prev_id = targetPrevList?.id
  targetList.next_id = targetNextList?.id

  reorderedLists.add(targetList)

  dragAndDropStore.setDraggingList(targetList)

  listsCopy.value.forEach((list) => {
    const reorderedList = [...reorderedLists].find((reorderedList) => reorderedList.id === list.id)

    if (reorderedList !== undefined) {
      list.next_id = reorderedList.next_id
      list.prev_id = reorderedList.prev_id
    }
  })

  lists.value = listsCopy.value
}
</script>

<template>
  <div class="p-3 h-screen relative">
    <div class="flex flex-row gap-4 justify-start max-h-full min-h-full">
      <div :ref="listElements.set" v-for="list in sortedLists" :key="list.id" :data-id="list.id">
        <BoardList
          :tasks="tasksForList.get(list.id) || []"
          :list="list"
          @tasks-reordered="reorderTasks"
        />
      </div>
    </div>
    <div class="fixed top-0 right-0 bg-black text-white py-1 px-2 rounded-md m-3">
      x: {{ mousePosition.x }} y: {{ mousePosition.y }}
    </div>
  </div>
</template>
