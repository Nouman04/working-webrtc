import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { UserGuard } from './user.guard';
const routes: Routes = [
  {path:"user" , children:[
    {path:"login", component:LoginComponent},
    {path:"chat", component:ChatComponent, canActivate: [UserGuard]},
    {path:"**", component:LoginComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
