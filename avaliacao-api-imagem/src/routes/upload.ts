import { Router } from 'express'
import * as path from 'path'
import * as fs from 'fs'
import { ArquivoController, ErroUpload } from '../controllers/ArquivoController'

export const uploadRouter = Router()

uploadRouter.post('/', async (req, res) => {
    if (!req.files || Object.keys(req.files).length == 0) {
        return res.status(400).send('Nenhuma imagem  recebida')
    }

    const nomesImages = Object.keys(req.files)
    const diretorio = path.join(__dirname, '..', '..', 'images')
    if (!fs.existsSync(diretorio)) {
        fs.mkdirSync(diretorio)
    }

    const bd = req.app.locals.bd
    const imgeCtrl = new ArquivoController(bd)
    const idsImagesSalvas = []
    let quantidadeErroGravacao = 0
    let quantidadeErroObjImagemInvalido = 0
    let quantidadeErroInesperado = 0


    const promises = nomesImages.map(async (image) => {
        const objImage = req.files[image]

        try {
            const idImage = await imgeCtrl.realizarUpload(objImage)
            idsImagesSalvas.push(idImage)
        } catch (erro) {
            switch (erro) {
                case ErroUpload.NAO_FOI_POSSIVEL_GRAVAR:
                    quantidadeErroGravacao++
                    break
                case ErroUpload.OBJETO_IMAGEM_INVALIDA:
                    quantidadeErroObjImagemInvalido++
                    break
                default:
                    quantidadeErroInesperado++
            }
        }

    })

    await Promise.all(promises)

    res.json({
        idsImagesSalvas,
        quantidadeErroGravacao,
        quantidadeErroInesperado,
        quantidadeErroObjImagemInvalido
    })

})