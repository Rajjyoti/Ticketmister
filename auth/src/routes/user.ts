import express, {Request, Response} from 'express'
import {body, validationResult} from 'express-validator'
import { RequestValidationError } from '../errors/requestValidationError';
import { User } from '../models/user';
import { BadRequestError } from '../errors/badRequestError';

const router = express.Router()

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage("Password Length must be between 4 and 20 characters")
], async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array())
    }

    const {email, password} = req.body

    const existingUser = await User.findOne({email})

    if (existingUser) {
        throw new BadRequestError('Email already in use')
    }

    const user  = User.build({email, password})
    await user.save()

    res.status(201).send(user)

})


router.delete('/api/users/all', async(req: Request, res: Response) => {
    await User.deleteMany();
    res.send('All users deleted');
})

router.post('/api/users/signin', async(req: Request, res: Response) => {
    res.send('ok')
})

router.post('/api/users/signout', async(req: Request, res: Response) => {
    res.send('ok')
})

router.get('/api/users/:id', async(req: Request, res: Response) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).send('User not found');
    }
    res.send(user);
})

export {router as userRouter}

