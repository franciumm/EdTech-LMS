import DBConnect from '../DB/DB.Connect.js';
import { globalerrorHandling, notFound } from './utils/erroHandling.js';
import cors from 'cors';
import auth from './auth/auth.router.js'
import group from "./Modules/Groups/Group.router.js"
import assg from './Modules/Assignments/Assg.router.js'
import exam  from './Modules/Exams/Exams.router.js'
import mater from "./Modules/Materials/Materials.router.js"
import section from "./Modules/Sections/section.router.js" 
import search from "./Modules/Search/search.router.js"     
import assistant from "./Modules/Assistants/assistant.router.js"     
import healthRouter from './Modules/health/health.router.js';
import reportRouter from "./Modules/Reports/student.report.router.js";
import courseRouter from "./Modules/Courses/Courses.router.js"
import reviewsRouter from "./Modules/reviews/reviews.router.js"
import contactRouter from './Modules/Contact/contact.router.js';

const bootstrape =  async (app,express)=>{
    app.use('/api/v1/group',group);
    app.use('/api/v1/exams',exam);
    app.use("/api/v1/assignments", assg)
    app.use('/api/v1/student',auth);
    app.use('/api/v1/material',mater);
    app.use('/api/v1/sections', section); 
    app.use('/api/v1/search', search);  
    app.use('/api/v1/assistant', assistant);
    app.use('/api/v1/health', healthRouter);
    app.use("/api/v1/reports", reportRouter);
    app.use("/api/v1/courses", courseRouter);
    app.use("/api/v1/reviews", reviewsRouter);
    app.use('/api/v1/contact', contactRouter); 
    app.use('*', notFound);          
    app.use(globalerrorHandling);

    
}


export default bootstrape;
