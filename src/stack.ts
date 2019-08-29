import { Route } from 'vue-router'

export interface StackItem {
  key: string
  route: Route
}

export type Stack = StackItem[]

const stack: Stack = []

export default stack

