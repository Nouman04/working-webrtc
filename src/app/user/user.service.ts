import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  isLoggedIn : boolean;
  credentials :{};
  constructor() { 
    this.isLoggedIn = false;
  }
}
