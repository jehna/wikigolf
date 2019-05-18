import Koa from 'koa'
import koaStatic from 'koa-static'
import apiRouter from './api'

const app = new Koa()
app.use(koaStatic('public'))
app.use(apiRouter.routes())

app.listen(process.env.PORT)
