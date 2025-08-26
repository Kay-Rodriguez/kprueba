import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerUsuarios from './routers/usuario_routes.js'

dotenv.config()
const app = express()

app.set('port', process.env.PORT || 3000)
app.use(cors())
app.use(express.json())
app.use('/api', routerUsuarios)

app.get('/', (req, res) => {
    res.send("Server on")
})

app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"))

export default app