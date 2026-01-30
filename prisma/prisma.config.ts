// prisma/prisma.config.ts
import { defineConfig } from 'prisma'

export default defineConfig({
  datasource: {
    postgresql: {
      url: process.env.DATABASE_URL!
    }
  }
})