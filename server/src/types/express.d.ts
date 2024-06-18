import { User } from '../server'; // Adjust the import based on where your User interface is defined

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
    }
}
