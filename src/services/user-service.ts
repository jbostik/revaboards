import { User } from "../models/user";
import { UserRepository } from "../repos/user-repo";
import { isValidId, isValidStrings, isValidObject, isPropertyOf, isEmptyObject } from "../util/validator";
import { 
    BadRequestError, 
    ResourceNotFoundError, 
    NotImplementedError, 
    ResourcePersistenceError, 
    AuthenticationError 
} from "../errors/errors";


export class UserService {

    constructor(private userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    async getAllUsers(): Promise<User[]> {

        try {

            let users = await this.userRepo.getAll();

            if (users.length == 0) {
                throw new ResourceNotFoundError();
            }

            return users.map(this.removePassword);

        } catch (e) {
            throw e;
        }

    }

    async getUserById(id: number): Promise<User> {

        try {

            if (!isValidId(id)) {
                throw new BadRequestError();
            }

            let user = await this.userRepo.getById(id);

            if (isEmptyObject(user)) {
                throw new ResourceNotFoundError();
            }

            return this.removePassword(user);

        } catch (e) {
            throw e;
        }

    }

    async getUserByUniqueKey(queryObj: any): Promise<User> {

        // we need to wrap this up in a try/catch in case errors are thrown for our awaits
        try {

            let queryKeys = Object.keys(queryObj);

            if(!queryKeys.every(key => isPropertyOf(key, User))) {
                throw new BadRequestError();
            }

            // we will only support single param searches (for now)
            let key = queryKeys[0];
            let val = queryObj[key];

            // if they are searching for a user by id, reuse the logic we already have
            if (key === 'id') {
                return await this.getUserById(+val);
            }

            // ensure that the provided key value is valid
            if(!isValidStrings(val)) {
                throw new BadRequestError();
            }

            let user = await this.userRepo.getUserByUniqueKey(key, val);

            if (isEmptyObject(user)) {
                throw new ResourceNotFoundError();
            }

            return this.removePassword(user);

        } catch (e) {
            throw e;
        }
    }

    async authenticateUser(un: string, pw: string): Promise<User> {

        try {

            if (!isValidStrings(un, pw)) {
                throw new BadRequestError();
            }

            let authUser: User;
            
            authUser = await this.userRepo.getUserByCredentials(un, pw);
           

            if (isEmptyObject(authUser)) {
                throw new AuthenticationError('Bad credentials provided.');
            }

            return this.removePassword(authUser);

        } catch (e) {
            throw e;
        }

    }

    async addNewUser(newUser: User): Promise<User> {
        
        try {

            if (!isValidObject(newUser, 'id')) {
                throw new BadRequestError('Invalid property values found in provided user.');
            }

            let conflict = this.getUserByUniqueKey({username: newUser.username});
        
            if (conflict) {
                throw new ResourcePersistenceError('The provided username is already taken.');
            }
        
            conflict = this.getUserByUniqueKey({email: newUser.email});
    
            if (conflict) {
                throw new  ResourcePersistenceError('The provided email is already taken.');
            }

            const persistedUser = await this.userRepo.save(newUser);

            return this.removePassword(persistedUser);

        } catch (e) {
            throw e
        }

    }

    async updateUser(updatedUser: User): Promise<boolean> {
        
        try {

            if (!isValidObject(updatedUser)) {
                throw new BadRequestError('Invalid user provided (invalid values found).');
            }

            // let repo handle some of the other checking since we are still mocking db
            return await this.userRepo.update(updatedUser);
        } catch (e) {
            throw e;
        }

    }

    async deleteById(id: number): Promise<boolean> {
        
        try {
            throw new NotImplementedError();
        } catch (e) {
            throw e;
        }

    }

    private removePassword(user: User): User {
        if(!user || !user.password) return user;
        let usr = {...user};
        delete usr.password;
        return usr;   
    }

}