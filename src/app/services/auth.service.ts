import { Injectable } from '@angular/core';
import { Client, Account, ID, Models } from 'appwrite';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  $id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private client: Client;
  private account: Account;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.client = new Client()
      .setEndpoint(environment.appwrite.endpoint)
      .setProject(environment.appwrite.projectId);
    
    this.account = new Account(this.client);
    this.checkSession();
  }

  private async checkSession() {
    try {
      const session = await this.account.get();
      this.userSubject.next(session);
    } catch (error) {
      this.userSubject.next(null);
    }
  }

  register(email: string, password: string, name: string): Observable<User> {
    return from(
      this.account.create(
        ID.unique(), // userId
        email,      // email
        password,   // password
        name        // name
      ).then(response => {
        this.userSubject.next(response);
        return response;
      })
    );
  }

  login(email: string, password: string): Observable<Models.User<Models.Preferences>> {
    return from(
      this.account.createSession(email, password)
        .then(() => this.account.get())
        .then((user: Models.User<Models.Preferences>) => {
          this.userSubject.next(user);
          return user;
        })
    );
  }

  logout(): Observable<any> {
    return from(
      this.account.deleteSession('current')
        .then(() => {
          this.userSubject.next(null);
        })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  isAuthenticated(): Observable<boolean> {
    return new Observable(subscriber => {
      this.user$.subscribe(user => {
        subscriber.next(!!user);
      });
    });
  }
}
