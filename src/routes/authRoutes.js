import {Router} from 'express';
import {signup, login, logout} from '../controllers/authController.js';

const router = Router();


router.post('/vendor/register', signup);
router.post('/vendor/login', login);
router.post('/vendor/logout', logout);



export default router;
