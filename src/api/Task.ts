interface Task {
  id: number
  title: string
  list_id: number
  next_id: number | undefined
  prev_id: number | undefined
}
