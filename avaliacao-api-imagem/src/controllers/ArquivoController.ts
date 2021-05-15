import { Db, GridFSBucket, ObjectId } from "mongodb"
import { join } from 'path'
import {
    existsSync,
    mkdirSync,
    writeFileSync,
    createReadStream,
    unlinkSync,
    createWriteStream
} from 'fs'

export enum ErroUpload {
    OBJETO_IMAGEM_INVALIDA = 'Objeto de imagem inválida',
    NAO_FOI_POSSIVEL_GRAVAR = 'Não foi possível gravar a imagem no banco de dados'
}

export enum ErroDownload {
    ID_INVALIDO = 'ID inválido',
    NENHUMA_IMAGEM_ENCONTRADA = 'Nenhuma imagem encontrada com este id',
    NAO_FOI_POSSIVEL_GRAVAR = 'Não foi possível gravar a imagem recuperada'
}


export class ArquivoController {

    private _bd: Db
    private _caminhoDiretorioArquivos: string


    constructor(bd: Db) {
        this._bd = bd
        this._caminhoDiretorioArquivos = join(__dirname, '..', '..', 'arquivos_temporarios')
        if (!existsSync(this._caminhoDiretorioArquivos)) {
            mkdirSync(this._caminhoDiretorioArquivos)
        }
    }

    private _ehUmObjetoDeArquivoValido(objArquivo: any): boolean {
        return objArquivo
            && 'name' in objArquivo
            && 'data' in objArquivo
            && objArquivo['name']
            && objArquivo['data']
            && objArquivo['mimetype'] === 'image/jpg'
            || objArquivo['mimetype'] === 'image/png'

    }

    private _inicializarBucket(): GridFSBucket {
        return new GridFSBucket(this._bd, {
            bucketName: 'images'
        })
    }

    realizarUpload(objArquivo: any): Promise<ObjectId> {
        return new Promise((resolve, reject) => {
            if (this._ehUmObjetoDeArquivoValido(objArquivo)) {
                const bucket = this._inicializarBucket()

                const nomeArquivo = objArquivo['name']
                const conteudoArquivo = objArquivo['data']
                const nomeArquivoTemp = `${nomeArquivo}_${(new Date().getTime())}`

                const caminhoArquivoTemp = join(this._caminhoDiretorioArquivos, nomeArquivoTemp)
                writeFileSync(caminhoArquivoTemp, conteudoArquivo)


                const streamGridFS = bucket.openUploadStream(nomeArquivo, {
                    metadata: {
                        mimetype: objArquivo['mimetype']
                    },

                })



                const streamLeitura = createReadStream(caminhoArquivoTemp)
                streamLeitura
                    .pipe(streamGridFS)
                    .on('finish', () => {
                        unlinkSync(caminhoArquivoTemp)
                        resolve(new ObjectId(`${streamGridFS.id}`))
                    })
                    .on('error', erro => {
                        console.log(erro)
                        reject(ErroUpload.NAO_FOI_POSSIVEL_GRAVAR)
                    })
            } else {
                reject(ErroUpload.OBJETO_IMAGEM_INVALIDA)
            }

        })

    }

    realizarDownload(id: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (id && id.length == 24) {
                const _id = new ObjectId(id)
                const bucket = this._inicializarBucket()
                const resultados = await bucket.find({ '_id': _id }).toArray()
                if (resultados.length > 0) {
                    const metadados = resultados[0]
                    const streamGridFS = bucket.openDownloadStream(_id)
                    const caminhoArquivo = join(this._caminhoDiretorioArquivos, metadados['filename'])
                    const streamGravacao = createWriteStream(caminhoArquivo)
                    streamGridFS
                        .pipe(streamGravacao)
                        .on('finish', () => {
                            resolve(caminhoArquivo)
                        })
                        .on('erro', erro => {
                            console.log(erro)
                            reject(ErroDownload.NAO_FOI_POSSIVEL_GRAVAR)
                        })
                } else {
                    reject(ErroDownload.NENHUMA_IMAGEM_ENCONTRADA)
                }

            } else {
                reject(ErroDownload.ID_INVALIDO)
            }

        })
    }
}
