<script setup lang="ts">
import BoardList from '@/components/BoardList.vue'
import { ref } from 'vue'

interface Task {
  id: number
  title: string
  list_id: number
}

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
    list_id: 1
  },
  {
    id: 2,
    title: 'Tests for all API methods',
    list_id: 1
  },
  {
    id: 3,
    title: 'OpenAPI documentation for all API endpoints',
    list_id: 1
  },
  {
    id: 4,
    title: 'Kotlindoc for all methods inside API',
    list_id: 1
  },
  {
    id: 5,
    title: 'Flow charts of every opration in excalidraw',
    list_id: 1
  },
  {
    id: 6,
    title: 'README for every project repository',
    list_id: 1
  },
  {
    id: 7,
    title: 'Grafana monitoring?',
    list_id: 1
  },
  {
    id: 8,
    title: 'Deploy with docker swarm',
    list_id: 1
  },
  {
    id: 9,
    title: 'Drag-n-drop for tasks between lists',
    list_id: 3
  },
  {
    id: 10,
    title: 'Custom lists creation button',
    list_id: 2
  },
  {
    id: 11,
    title: 'Lists drag-n-drop',
    list_id: 2
  },
  {
    id: 12,
    title: 'Respect position of the dropped task in a list',
    list_id: 2
  }
])

function listTasks(listId: number): Task[] {
  return tasks.value.filter((t) => t.list_id == listId)
}
</script>

<template>
  <div class="p-3 h-screen">
    <div class="flex flex-row gap-4 justify-start max-h-full">
      <BoardList v-for="list in lists" :key="list.id" :tasks="listTasks(list.id)">
        {{ list.name }}
      </BoardList>
    </div>
  </div>
</template>
