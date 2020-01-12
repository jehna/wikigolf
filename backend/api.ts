import Router from 'koa-router'
import { getShortestRoute } from './model'

const router = new Router({
  prefix: '/api'
})

router.get('/shortest-route', async ctx => {
  ctx.set('Cache-Control', 'public, max-age=108000')

  if (typeof ctx.query.from !== 'string' || typeof ctx.query.to !== 'string' || !['fi', 'en'].includes(ctx.query.locale)) {
    ctx.status = 400
    return
  }

  const result = await getShortestRoute(ctx.query.from, ctx.query.to, ctx.query.locale)
  if (result === null) {
    ctx.status = 404
    return
  }

  ctx.body = result
})

export default router
