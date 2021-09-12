import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  msg: string;
  errorMsgFlag: boolean;

  user = new FormGroup({
    email: new FormControl('',[Validators.required,Validators.email]),
    password: new FormControl('',[Validators.required,Validators.minLength(5)])
  })
  constructor( private route:Router, private userInfo : UserService) { }

  ngOnInit(): void {
  }

  get email(){
    return this.user.get('email');
  }
  get password(){
    return this.user.get('password');
  }

  submitLogin(){
    let data = {email :this.user.value.email, password: this.user.value.password}
      fetch('https://working-webrtc.herokuapp.com/login',{
        method: "POST",
        body:JSON.stringify(data),
        headers: {
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
                },
      }).then((res) =>{
        return res.json();
      }).then((info) =>{
        if(info == "no user found")
        {
          this.errorMsgFlag = true;
          this.msg = "Credential Not matched";        
        }else
        {
            this.userInfo.isLoggedIn  = true;
            this.userInfo.credentials = data;
            window.localStorage.setItem('userInformation',JSON.stringify(data))
            this.route.navigate(['/user/chat']);
        } 
      })
  }

}
