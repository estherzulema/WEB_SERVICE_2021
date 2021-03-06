import { Router } from 'express'
import { unlinkSync } from 'fs'
import { ArquivoController, ErroDownload } from '../controllers/ArquivoController'

export const downloadRouter = Router()

downloadRouter.get('/thumb/:id ', async (req, res) => {
    const id = req.params.id
    const bd = req.app.locals.bd
    const imgeCtrl = new ArquivoController(bd)

    try {
        const caminhoArquivo = await imgeCtrl.realizarDownload(id)
        return res.download(caminhoArquivo, () => {
            unlinkSync(caminhoArquivo)
        })
    } catch (erro) {
        switch (erro) {
            case ErroDownload.ID_INVALIDO:
                return res.status(400).json({ mensagem: ErroDownload.ID_INVALIDO })
            case ErroDownload.NAO_FOI_POSSIVEL_GRAVAR:
                return res.status(500).json({ mensagem: ErroDownload.NAO_FOI_POSSIVEL_GRAVAR })
            case ErroDownload.NENHUMA_IMAGEM_ENCONTRADA:
                return res.status(404).json({ mensagem: ErroDownload.NENHUMA_IMAGEM_ENCONTRADA })
            default:
                return res.status(500).json({ mensagem: 'Erro no servidor' })

        }
    }

})
downloadRouter.get('/normal/:id', async (req, res) => {
    const id = req.params.id
    const bd = req.app.locals.bd
    const imgeCtrl = new ArquivoController(bd)

    try {
        const caminhoArquivo = await imgeCtrl.realizarDownload(id)
        return res.download(caminhoArquivo, () => {
            unlinkSync(caminhoArquivo)
        })
    } catch (erro) {
        switch (erro) {
            case ErroDownload.ID_INVALIDO:
                return res.status(400).json({ mensagem: ErroDownload.ID_INVALIDO })
            case ErroDownload.NAO_FOI_POSSIVEL_GRAVAR:
                return res.status(500).json({ mensagem: ErroDownload.NAO_FOI_POSSIVEL_GRAVAR })
            case ErroDownload.NENHUMA_IMAGEM_ENCONTRADA:
                return res.status(404).json({ mensagem: ErroDownload.NENHUMA_IMAGEM_ENCONTRADA })
            default:
                return res.status(500).json({ mensagem: 'Erro no servidor' })

        }

    }

})

