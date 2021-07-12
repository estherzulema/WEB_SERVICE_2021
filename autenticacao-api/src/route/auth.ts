import { Router } from 'express'
import { sign } from 'jsonwebtoken'

import { AuthController } from '../controller/AuthController'
import { STATUS, User } from '../entity/User'
import { STATUSAPP, App } from '../entity/App'
import { SECRET } from '../config/secret'
import { UserToApp } from '../entity/UseApp'

export const authRouter = Router()

authRouter.post('/user/register', async (req, res) => {
    const { email, name, password} = req.body
    
    const user: User = new User(email, name, password)
    const response = user.isValid()

    if(response == STATUS.OK){
        const authCtrl = new AuthController()
        const userEmail = await authCtrl.findUserByEmail(email)
        try{
            email == userEmail.email
            return res.status(400).json({message: STATUSAPP.EMAIL_EXISTING})
        } catch(error){
        }
        try{
            const savedUser = await authCtrl.registerUser(user)
            return res.json(savedUser)
        } catch(error){
            return res.status(500).json({message: STATUS.REGISTER_ERROR})
        }
    }else{
        return res.status(400).json({message: response})
    }
})

authRouter.post('/app/register', async (req,res) => {
    const { id_app, secret, expiresIn} = req.body

    const app: App = new App(id_app, secret, expiresIn)
    const response =  app.isValid()
    
    if(response == STATUSAPP.OK){
        const authCtrl = new AuthController()
        const idAppBD = await authCtrl.findAppById(id_app)
        try{
            id_app == idAppBD.id_app
            return res.status(400).json({message: STATUSAPP.ID_EXISTING})
        } catch(error){

        }
      
        try{
            const savedApp = await authCtrl.registerApp(app)
            return res.json(savedApp)
        } catch(error){
            return res.status(500).json({message: STATUSAPP.REGISTER_ERROR})
        }
    }else{
        return res.status(400).json({message: response})
    }
})

authRouter.post('/app/associate', async (req,res) => {
    const { email, id_app} = req.body
    
    const authCtrl = new AuthController()
    const recuperaEmail = await authCtrl.findUserByEmail(email)

    

    const recuperaIdapp = await authCtrl.findAppById(id_app)

    if(!recuperaIdapp){
        return res.status(400).json({message: STATUSAPP.INVALID_ID_APP})
    }

    const appTouser = new UserToApp()
    appTouser.email = recuperaEmail.email,
   
    appTouser.id_app = recuperaIdapp.id_app

    const recuperaEmaildoApp = await authCtrl.findUserByEmail(appTouser.email)
   
       
    

})

authRouter.post('/user/login', async (req, res) => {
    const { email, password, id_app} = req.body

    const authCtrl = new AuthController()


    const recuperaIdapp = await authCtrl.findAppById(id_app);

    if(!recuperaIdapp && id_app){
        return res.status(400).json({message: STATUSAPP.INVALID_ID_APP})
    }

    const user = await authCtrl.findUserByEmail(email)

    if(!user){
        return res.status(400).json({message: STATUS.INVALID_EMAIL})
    }

    if(user && user.isPasswordCorrect(password) && recuperaIdapp){
        const token = sign(
            { user: email, timestamp: new Date()},
            recuperaIdapp.secret,
            {
                expiresIn: recuperaIdapp.expiresIn
            }
        )
        res.json({
            authorized: true,
            secretApp: recuperaIdapp.secret,
            user,
            token,
        })
    } 
    
    if(user && user.isPasswordCorrect(password)){
        const token = sign(
            { user: email, timestamp: new Date()},
                SECRET,
            {
                expiresIn: "5m"
            }
        )
        res.json({
            authorized: true,
            SECRET,
            user,
            token
        })
    }  else{
        return res.status(401).json({
            authorized: false,
            message: STATUS.NOT_AUTHORIZED
        })
    }

  
})

authRouter.get('/esthers_secret', AuthController.verifyToken, (req, res) => {
    res.json({ secretMessage: "it will only go wrong if you try!" })
})