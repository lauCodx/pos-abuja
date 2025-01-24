import { db } from "../config/db.config";
import { SigninUserInterface, User } from "../interfaces/user.signin.interface";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

export class UserService {
    async create(user: User): Promise<User> {
        const email = user.email;
        const password = user.password;
        try {
            const userExist = await db.collection('Users').doc(email).get();
            if (userExist.exists) {
                throw new Error('User already exists')
            };
            const hashPassword = await bcrypt.hash(password, 10);
            await db.collection('Users').add({...user, password:hashPassword});
            return user
            
        } catch (error) {
            throw error
        }
    };

    async signIn(user: SigninUserInterface): Promise<string> {
        const email = user.email;
        const password = user.password;
        try {
            const userExist = await db.collection('Users').doc(email).get();
            if (!userExist.exists) {
                throw new Error('User does not exist')
            };

            const userData = userExist.data();
            if (!userData) {
                throw new Error('User data is undefined');
            }
            const checkPassword = await bcrypt.compare(password, userData.password);
            if (!checkPassword){
                throw new Error('Invalid credentials')
            }
            
            const token = jwt.sign(
                {id: userData.id, email: userData.email, role: userData.role}, 
                process.env.JWT_SECRET as string, 
                {expiresIn: '1h'}
            );

            return token

        } catch (error) {
            throw error
        }
    }
}