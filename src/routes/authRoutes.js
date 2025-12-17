import {Router} from 'express';
const authController = require('../controllers/authController');
import {signup, login, logout} from '../controllers/authController';

const router = Router();


router.post('/vendor/register', signup);
router.post('/vendor/login', login);



module.exports = router;
