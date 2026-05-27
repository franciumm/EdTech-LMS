import {Router} from 'express';
import * as UserStart from './controller/User.Start.js'
import * as UserMailConfirm from './controller/Emailer.js'
import * as Joi from './Validations.js'
import Joivalidation from '../middelwares/JoiValidation.js';
import * as PasswordC from './controller/password.js'
import { isAuth ,AdminAuth  } from '../middelwares/auth.js';
import { loginLimiter, emailLimiter } from '../middelwares/ratelimiter.js';
const router = Router ();


router.post ('/signup',Joivalidation(Joi.signup),UserStart.Signup);
router.get('/confirmEmail/:email', emailLimiter, UserMailConfirm.confirmEmail);
router.get('/newConfirmEmail/:email', emailLimiter, UserMailConfirm.newConfirmEmail);
router.post('/login',loginLimiter,Joivalidation(Joi.Login),UserStart.Login );
router.post('/teacher/login',loginLimiter,Joivalidation(Joi.Login),UserStart.AdminLogin );
router.post ('/forget', emailLimiter, Joivalidation(Joi.forgetPassword),PasswordC.forgetPassword);
router.post ('/reset/:token',Joivalidation(Joi.resetPassword),PasswordC.ResetPassword);
router.get("/profile", isAuth , UserStart.getMyProfile);
router.get("/unassigned",isAuth,UserStart.getUnassignedByGrade);


export default router;
