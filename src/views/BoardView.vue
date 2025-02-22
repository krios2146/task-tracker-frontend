<script setup lang="ts">
import BoardList from '@/components/BoardList.vue'
import { ref } from 'vue'
import { useMouse } from '@vueuse/core'
import { computed } from 'vue'

interface List {
  id: number
  name: string
}

const lists = ref<List[]>([
  {
    id: 1,
    name: 'Backlog'
  },
  {
    id: 2,
    name: 'TODO'
  },
  {
    id: 3,
    name: 'In Progress'
  },
  {
    id: 4,
    name: 'In Review'
  },
  {
    id: 5,
    name: 'Done'
  }
])

const tasks = ref<Task[]>([
  {
    id: 1,
    title: 'CI/CD for task-tracker',
    list_id: 1,
    next_id: 3,
    prev_id: 2
  },
  {
    id: 2,
    title: 'Tests for all API methods',
    list_id: 1,
    next_id: 1,
    prev_id: undefined
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
    list_id: 3,
    next_id: 10,
    prev_id: 8
  },
  {
    id: 10,
    title: 'Custom lists creation button',
    list_id: 2,
    next_id: 11,
    prev_id: 9
  },
  {
    id: 11,
    title: 'Lists drag-n-drop',
    list_id: 2,
    next_id: 12,
    prev_id: 10
  },
  {
    id: 12,
    title: 'Respect position of the dropped task in a list',
    list_id: 2,
    next_id: 13,
    prev_id: 8
  },
  {
    id: 13,
    title:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique animi, quas delectus, ullam tenetur quae nesciunt laudantium odit deleniti quaerat sit laboriosam suscipit cupiditate saepe quod voluptas, facilis dolor nostrum.',
    list_id: 1,
    next_id: 14,
    prev_id: 12
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

type MouseCoordinates = {
  x: number
  y: number
}

const { x, y } = useMouse()

const mouseCoordinates = computed<MouseCoordinates>(() => {
  return {
    x: x.value,
    y: y.value
  }
})

function listTasks(listId: number): Task[] {
  return tasks.value.filter((t) => t.list_id == listId)
}

function reorderTasks(reorderedTasks: Task[]): void {
  const hasBeenReordered = (task: Task) =>
    reorderedTasks.some((reorderedTask) => reorderedTask.id == task.id)

  const findReorderedTask = (task: Task) =>
    reorderedTasks.find((reorderedTask) => reorderedTask.id == task.id)

  tasks.value.forEach((task) => {
    if (hasBeenReordered(task)) {
      const reorderedTask = findReorderedTask(task)!

      task.next_id = reorderedTask.next_id
      task.prev_id = reorderedTask.prev_id
    }
  })
}
</script>

<template>
  <div class="p-3 h-screen">
    <div class="flex flex-row gap-4 justify-start max-h-full min-h-full">
      <BoardList
        v-for="list in lists"
        :key="list.id"
        :tasks="listTasks(list.id)"
        :list="list"
        :mouse-coordinates="mouseCoordinates"
        @tasks-reordered="reorderTasks"
      />
    </div>
  </div>
</template>
