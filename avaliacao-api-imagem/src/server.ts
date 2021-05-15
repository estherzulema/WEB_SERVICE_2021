import { app } from './app'
import { conectarNoBD } from './config/db'

const porta = process.env.PORT || 3000

const server = app.listen(
    porta,
    () => {
        conectarNoBD()
        console.log(`App ouvindo na porta ${porta}`)
    }
)

process.on('SIGINT', () => {
    server.close()
    console.log('App finalizado')
})