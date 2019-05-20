import Router from 'koa-router'
import { getShortestRoute } from './model'

const router = new Router({
  prefix: '/api'
})

router.get('/shortest-route', async ctx => {
  ctx.set('Cache-Control', 'public, max-age=31536000, immutable')

  if (typeof ctx.query.from !== 'string' || typeof ctx.query.to !== 'string') {
    ctx.status = 300
    return
  }

  const result = await getShortestRoute(ctx.query.from, ctx.query.to)
  if (result === null) {
    ctx.status = 404
    return
  }

  ctx.body = result
})

export default router
