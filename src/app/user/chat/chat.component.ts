import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SocketService } from '../socket.service';
import { UserService } from '../user.service';

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};




@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  


  users : any;
  activeEmails: any;
  chat : Array<any> = [];
  conversation : Array<any> = [];
  recieverEmail : any;
  userCredentials :any;
  userEmail:any;
  message:any;
  localStream : MediaStream;
  localAudioTrack: any;
  localVideoTrack: any;
  videoCallerEmail: any;


//Wrtc Variables
  rtc    : RTCPeerConnection;
  config : any;
  callerEmail :any;
  remoteOffer :any;
  ringingFlag : boolean;



  constructor(private webSocket: SocketService, private user: UserService) {
    //assigning users list
    this.users = 
    [
      {id: 1, email: "mnoumanb@gmail.com" , password: "nouman1234"  , status: "away"},
      {id: 2, email: "anees@gmail.com" , password: "anees1234" , status: "away"},
      {id: 3, email: "shahbaz@gmail.com" , password: "shahbaz1234" , status: "away"},
      {id: 4, email: "junaid@gmail.com" , password: "junaid1234" , status: "away"},
      {id: 5, email: "usman@gmail.com" , password: "usman1234" , status: "away"},
      {id: 6, email: "shujat@gmail.com" , password: "shujat1234" , status: "away"},
      {id: 7, email: "ali@gmail.com" , password: "ali1234" , status: "away"},
    ]

    this.config = { 'iceServers': [{"urls":"stun:stun1.l.google.com:19302"}] } ;
    this.ringingFlag = true;
   }

   
   

  ngOnInit(): void {

    this.loginSocket();
    this.getRegisteredEmails();
    this.getServerUsers();
    this.recieveMessage();
    this.getMediaStream();
    this.offlineUser();
    this.recieveVideoCall();
    this.recieveAnswer()
    this.recieveCandidate();
  }



  //Frontend Functions
  private getServerUsers()
  {
    let userInfo :any = this.user.credentials;
    this.users = this.users.filter((user:any)=>{
      if(user.email != userInfo.email)
      {
        return user;
      }
    })
    //also assign this user value
    
    this.userCredentials = this.user.credentials
    this.userEmail = this.userCredentials.email;
  }
  //on click get user information
  getUserInformation(event:any)
  {
    let p = event.target;
    this.recieverEmail= p.innerText;
    let messageArea = document.getElementById('content')!;
    messageArea?.classList.add("show");
    this.updateChat();
  }


  //Socket Functions
  //login Socket 
  private loginSocket()
  {
    if(this.user.credentials == undefined)
    {
      this.user.credentials = JSON.parse(localStorage.getItem('userInformation')!);
      this.webSocket.socket.emit("loggedIn",this.user.credentials);
    }else{
      this.webSocket.socket.emit("loggedIn",this.user.credentials);
    }
  }



  getRegisteredEmails()
  {
    this.webSocket.socket.on("registeredEmails",(emails:any)=>{
      this.activeEmails = emails;
      for(let i=0;i<emails.length; i++)
      {
        this.activeEmails= this.users.filter((user:any)=>{
          if(user.email == emails[i])
          {
            user.status = "online";
            return user;
          }
          return user;
        })
      }
    })
  }

  //send message
  sendMessage()
  {
    if(this.message == "")
    {
      return
    }else{
      let msgInfo ={user1:this.userEmail, user2:this.recieverEmail, msg:this.message, status:"sent"}
      this.chat.push(msgInfo);
      this.webSocket.socket.emit("sendMessage",this.userEmail,this.recieverEmail,this.message);
      this.message = "";
      this.updateChat();
    }
  }

  private recieveMessage()
  {
    this.webSocket.socket.on("recieveMessage",(senderEmail:any,recieverEmail:any,msg:any)=>{
      let message = {user1:senderEmail, user2: recieverEmail, msg:msg, status:"replies"};
      this.chat.push(message);
      this.updateChat();
    })
  }

  private updateChat()
  {
    this.conversation = this.chat.filter((info:any)=>{
      if((info.user1 == this.userEmail || info.user2 == this.userEmail) && (info.user1 == this.recieverEmail || info.user2 == this.recieverEmail) )
      {
        return info
      }
    })
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //WEBRTC starts here

  private createPeerConnection()
  {
    if(!this.getMediaStream)
    {
      this.getMediaStream();
    }
    
    this.rtc = new RTCPeerConnection(this.config);

    this.rtc.onicecandidate = this.handleICECandidateEvent;
    this.rtc.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    
    this.rtc.ontrack = (event: RTCTrackEvent)=>{
      let remoteVideo:any= document.getElementById('remoteVideo') as HTMLVideoElement;
      remoteVideo.srcObject = event.streams[0];
      console.log(event.streams[0]);
    }

    
    this.rtc.onsignalingstatechange= (event:Event)=>{
      switch (this.rtc.signalingState) {
        case 'closed':
          this.closeVideoCall();
          break;
      }
    };
  }

  private handleICECandidateEvent=(event : RTCPeerConnectionIceEvent)=>{
    if(event.candidate)
    {
      console.log(event.candidate)
      this.webSocket.socket.emit("sendCandidate",this.userEmail,this.recieverEmail,event.candidate);
    }
  }

  
  private handleICEConnectionStateChangeEvent(event: Event){
    switch(this.rtc.iceConnectionState)
    {
      case 'closed':
      case 'failed':
      case 'disconnected':
        this.closeVideoCall();
        break
    }
  }
  // private handleSignalingStateChangeEvent(event: Event){
  //   switch (this.rtc.signalingState) {
  //     case 'closed':
  //       this.closeVideoCall();
  //       break;
  //   }
  // }
  // private handleTrackEvent(event: RTCTrackEvent){
  //   let remoteVideo:any= document.getElementById('remoteVideo');
  //   remoteVideo.nativeElement.srcObject = event.streams[0];
  // }

  //add ice candidate
  private recieveCandidate()
  {
    this.webSocket.socket.on('recieveCandidate',(candidate:RTCIceCandidate)=>{
      const userCandidate = new RTCIceCandidate(candidate);
      if(!this.createPeerConnection)
      {
        this.createPeerConnection();
      }
      console.log(userCandidate);
      this.rtc.addIceCandidate(userCandidate).catch(this.reportError)
    })
  }

  private reportError = (e: Error) => {
    console.log('got Error: ' + e.name);
    console.log(e);
  }


  closeVideoCall()
  {
    if (this.rtc) {
      console.log('--> Closing the peer connection');

      this.rtc.ontrack = null;
      this.rtc.onicecandidate = null;
      this.rtc.oniceconnectionstatechange = null;
      this.rtc.onsignalingstatechange = null;

      // Stop all transceivers on the connection
      this.rtc.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });

      // Close the peer connection
      this.rtc.close();

      //this.inCall = false;
    }
  }
  //get local stream
  getMediaStream()
  {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {width: 160, height: 120}
    }).then((mediaStream)=>{
      //set local Stream
      this.localStream = mediaStream;
      //tracks
      this.localVideoTrack = this.localStream.getVideoTracks()[0];
      this.localAudioTrack = this.localStream.getAudioTracks()[0];
    }).catch(err=>{
      console.log(err);
    })
    
  }
  //audio Call
  audioCall()
  {
    let messageArea = document.getElementById("content")!;
    messageArea.classList.remove("show");
    let callArea = document.getElementById("call-area")!;
    callArea.classList.add("show");
  }
  //video call
  async videoCall()
  {
    let messageArea = document.getElementById("content")!;
    messageArea.classList.remove("show");
    let callArea = document.getElementById("call-area")!;
    callArea.classList.add("show");
    let localVideo:any = document.getElementById("localVideo")!;
    localVideo.srcObject = this.localStream;

    if(!this.rtc)
    {
      this.createPeerConnection();
    }
    if(!this.localStream)
    {
      this.getMediaStream();
    }

    console.log(this.localStream);
    //set track
    this.localStream.getTracks().forEach((track:any)=>{
      this.rtc.addTrack(track,this.localStream);
    })
    try{
      //create offer
      const offer: RTCSessionDescriptionInit = await this.rtc.createOffer(offerOptions);
      await this.rtc.setLocalDescription(offer);
      //send offer to user
      this.webSocket.socket.emit("offerVideoCall",this.userEmail,this.recieverEmail, {'type':'offer',data:offer});

    }catch(err)
    {
      this.handleUserMediaError(err);
    }

  }

    //toggle video
    toggleVideo(event: any)
    {
      
      let i = event.target;
      if(this.localVideoTrack.enabled == false)
      {
        i.classList.toggle('opacity');
        this.localVideoTrack.enabled = true;
      }else{
        i.classList.toggle('opacity');
        this.localVideoTrack.enabled = false;
      }
    }
  
    //toggle Audio
    toggleAudio(event: any)
    {
      let i = event.target;
      if(this.localAudioTrack.enabled == false)
      {
        
        i.classList.toggle('opacity');
        this.localAudioTrack.enabled = true;
      }else{
        i.classList.toggle('opacity');
        this.localAudioTrack.enabled = false;
      }
    }
  
    //Media Error
    private handleUserMediaError(err:any){
      switch (err.name) {
        case 'NotFoundError':
          alert('Unable to open your call because no camera and/or microphone were found.');
          break;
        case 'SecurityError':
        case 'PermissionDeniedError':
          // Do nothing; this is the same as the user canceling the call.
          break;
        default:
          console.log(err);
          alert('Error opening your camera and/or microphone: ' + err.message);
          break;
      }
  
      this.closeVideoCall();
    }

//Handle Remote User Event

private offlineUser(){
  this.webSocket.socket.on("notAvailableUser",()=>{
    console.log("User Not Available");
  })
  this.closeVideoCall();
}


private recieveVideoCall()
{
  this.webSocket.socket.on("recieveVideoCall",(senderEmail:any,offer:any)=>{
    this.remoteOffer = offer.data;
    this.callerEmail =  senderEmail;

     // open model box
  var modal = document.getElementById("myModal")!;
  modal.style.display = "block";
  })
}

acceptVideoCall()
{
    
    this.ringingFlag = false;
    let messageArea = document.getElementById("content")!;
    messageArea.classList.remove("show");
    let callArea = document.getElementById("call-area")!;
    callArea.classList.add("show");
 
this.closeModal();

  if(!this.rtc)
  {
    this.createPeerConnection();
  }
  if(!this.localStream)
  {
    this.getMediaStream();
  }
  this.rtc.setRemoteDescription(new RTCSessionDescription(this.remoteOffer))
  .then(()=>{
    let localVideo:any = document.getElementById("localVideo")!;
    localVideo.srcObject = this.localStream;
    this.localStream.getTracks().forEach((track:any)=>{
      this.rtc.addTrack(track,this.localStream);
    })
  }).then(()=>{
    return this.rtc.createAnswer();
  }).then(()=>{
    return this.rtc.setLocalDescription();
  }).then(()=>{
    this.webSocket.socket.emit("sendAnswer",this.userEmail,this.callerEmail,{type:'answer',data:this.rtc.localDescription})
  }).catch((err:any)=>{
    this.handleUserMediaError;
  })
}


private recieveAnswer()
{
  this.ringingFlag = false;
  this.webSocket.socket.on('recieveAnswer',(answerEmail:any,info:any)=>{
  this.rtc.setRemoteDescription(info.data);
  console.log(this.rtc)
  })
}

  closeModal(){
    let modal = document.getElementById("myModal")!;
    modal.style.display="none";
  }

}
