import Router from 'koa-router'
import { getShortestRoute } from './model'

const router = new Router({
  prefix: '/api'
})

router.get('/', async ctx => {
  ctx.body = await getShortestRoute('Hitler', 'JavaScript')
})

export default router
