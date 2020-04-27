import data from '../data/user-db';
import { User } from '../models/user';
import { CrudRepository } from './crud-repo';
import Validator from '../util/validator';
import {
    BadRequestError, 
    NotImplementedError, 
    ResourceNotFoundError, 
    ResourcePersistenceError
} from '../errors/errors';

export class UserRepository implements CrudRepository<User> {

    getAll(): Promise<User[]> {

        return new Promise<User[]>((resolve, reject) => {

            setTimeout(() => {
                let users: User[] = data;
                resolve(users);
            }, 250);

        });
    
    }

    getById(id: number): Promise<User> {

        return new Promise<User>((resolve, reject) => {

            setTimeout(() => {
                const user = {...data.find(user => user.id === id)};
                resolve(user);
            }, 250);

        });
    }

    getUserByUsername(un: string): Promise<User> {

        return new Promise<User>((resolve, reject) => {

            if (!Validator.isValidStrings(un)) {
                reject(new BadRequestError());
                return;
            }
           
            setTimeout(() => {
        
                const user = {...data.find(user => user.username === un)};
                
                if (Object.keys(user).length === 0) {
                    reject(new ResourceNotFoundError());
                    return;
                }
        
                resolve(user);
        
            }, 250);

        });
        
    
    }

    getUserByEmail(email: string): Promise<User> {

        return new Promise<User>((resolve, reject) => {

            if (!Validator.isValidStrings(email)) {
                reject(new BadRequestError());
                return;
            }
           
            setTimeout(() => {
        
                const user = {...data.find(user => user.email === email)};
                
                if (Object.keys(user).length == 0) {
                    reject(new ResourceNotFoundError());
                    return;
                }
        
                resolve(user);
        
            }, 250);

        });
        
    
    }

    getUserByCredentials(un: string, pw: string) {
        
        return new Promise<User>((resolve, reject) => {
        
            setTimeout(() => {
                const user = {...data.find(user => user.username === un && user.password === pw)};
                resolve(user);  
            }, 250);

        });
    
    }

    save(newUser: User): Promise<User> {
            
        return new Promise<User>((resolve, reject) => {
        
            setTimeout(() => { 
                newUser.id = (data.length) + 1;
                data.push(newUser);
                resolve(newUser);
            });

        });
    
    }

    update(updatedUser: User): Promise<boolean> {
        
        return new Promise<boolean>((resolve, reject) => {
        
            setTimeout(() => {
        
                let persistedUser = data.find(user => user.id === updatedUser.id);
        
                if (!persistedUser) {
                    reject(new ResourceNotFoundError('No user found with provided id.'));
                    return;
                }
                
                if (persistedUser.username != updatedUser.username) {
                    reject(new ResourcePersistenceError('Usernames cannot be updated.'));
                    return;
                }
        
                const conflict = data.find(user => {
                    if (user.id == updatedUser.id) return false;
                    return user.email == updatedUser.email; 
                });
        
                if (conflict) {
                    reject(new ResourcePersistenceError('Provided email is taken by another user.'));
                    return;
                }
    
                persistedUser = updatedUser;
    
                resolve(true);
        
            });

        });
    
    }

    deleteById(id: number): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {
            reject(new NotImplementedError());
        });
    }

}
