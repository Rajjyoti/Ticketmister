import express, {Request, Response} from 'express'
import {body} from 'express-validator'
import jwt from 'jsonwebtoken'

import { User } from '../models/user';
import { BadRequestError } from '../errors/badRequestError';
import { validateRequest } from '../middlewares/validateRequest';
import { Password } from '../services/password';
import { currentUser } from '../middlewares/currentUser';

const router = express.Router()

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage("Password Length must be between 4 and 20 characters")
], validateRequest, async (req: Request, res: Response) => {

    const {email, password} = req.body

    const existingUser = await User.findOne({email})

    if (existingUser) {
        throw new BadRequestError('Email already in use')
    }

    const user  = User.build({email, password})
    await user.save()

    //Generate JWT
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
        }, 
        process.env.JWT_KEY!
    )

    //Store on session object
    req.session = {jwt : userJwt}

    res.status(201).send(user)

})

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Please enter a password')
], validateRequest, async(req: Request, res: Response) => {

    const {email, password} = req.body

    const existingUser = await User.findOne({email})
    if (!existingUser) {
        throw new BadRequestError('Invalid Credentials')
    }

    const passwordsMatch = await Password.compare(existingUser.password, password)
    if (!passwordsMatch) {
        throw new BadRequestError('Invalid Credentials')
    }
    
    //Generate JWT
    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
        }, 
        process.env.JWT_KEY!
    )

    //Store on session object
    req.session = {jwt : userJwt}

    res.status(200).send(existingUser)
})

router.get('/api/users/current-user', currentUser, async(req: Request, res: Response) => {
    res.send({currentUser: req.currentUser || null})
})

router.post('/api/users/signout', async(req: Request, res: Response) => {
    req.session = null

    res.send({})
})

router.get('/api/users/:id', async(req: Request, res: Response) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).send('User not found');
    }
    res.send(user);
})

router.delete('/api/users/all', async(req: Request, res: Response) => {
    await User.deleteMany();
    res.send('All users deleted');
})

export {router as userRouter}

