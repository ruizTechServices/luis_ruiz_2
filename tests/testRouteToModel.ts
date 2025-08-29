// testRouteToModel.ts

import { routeToModel } from '../lib/functions/routeToModel'

const queries = [
  "How do I deploy a React app to production?",
  "Create a TypeScript interface for user data",
  "Explain the difference between let and const",
  "What's the best way to handle async operations?",
  "How do I optimize database queries?",
]

for (const query of queries) {
  const model = routeToModel(query)
  console.log(`🧠 Query: "${query}" -> 🛠 Model: ${model}`)
}
