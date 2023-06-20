import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
// import bootstrap from 'bootstrap';

let token = null;
let userID = null;
let currentChannelID = null;
let radioValue = null;

const Request = (route, method, body) => {
    const base = {
        method: method,
        headers: {
            'Content-type': 'application/json',
            'Authorization': '' + token
        },
    };
    if (body !== undefined) {
        base.body = JSON.stringify(body);
    }
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5005' + route, base).then((response) => {
            return response.json();
        }).then((data) => {
            // console.log(data);
            if (data.error) {
                alert (data.error);
            } else {
                resolve(data);
            }
        });
    });
}

//Login
document.getElementById('LoginAct').addEventListener('click', () => {
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    
    const data = Request('/auth/login', 'POST', {
        "email": email,
        "password": password
    })
    .then((data) => {
        token = data.token;
        userID = data.userId;
        localStorage.setItem('currentUserId',userID);
        login();
    })
    if (email === '' || password === '') {
        alert('Please enter your email and password.')
    }
});

document.getElementById('a_login').addEventListener('click', () => {
    document.getElementById('Register').classList.add('hide');
    document.getElementById('Login').classList.remove('hide');
}); 

const login = () => {
    document.getElementById('logged_in').classList.remove('hide');
    document.getElementById('logout').classList.add('hide');

    displayChannelList();
};

//Register
document.getElementById('RegisterAct').addEventListener('click', () => {
    const email = document.getElementById('register_email').value;
    const name = document.getElementById('register_username').value;
    const password = document.getElementById('register_password').value;
    
    const data = Request('/auth/register', 'POST', {
        "email": email,
        "password": password,
        "name": name
    }).then((data) => {
        login();
        token = data.token;
        userID = data.userID;
        localStorage.setItem('currentUserId',userID);
    });
    if (email === '' || name === '' || password1 === '' || password2 === '') {
        alert('Please enter all your information.')
    }
});

//Logout
document.getElementById('LogoutAct').addEventListener('click', () => {
    const data = Request('/auth/logout', 'POST', {
    }).then((data) => {
       logout();
    })
});



const showEmptyChannel = (id) => {
    document.getElementById('channels').classList.add('hide');
    document.getElementById('joinChannel').classList.remove('hide');
    
    const pageTips = document.createElement('p');
    pageTips.innerText = "You are not the member of this channel."
    document.getElementById('joinChannel').appendChild(pageTips);

    currentChannelID = id;
}


//Create A New Channel
const createNewChaneel = () => {
    const channelName = document.getElementById('channel_name').value;
    const channelDescription = document.getElementById('channel_description').value;

    radioCheck();
    const data = Request('/channel', 'POST', {
        "name": channelName,
        "private": radioValue,
        "description": channelDescription
    })
    .then((data) => {    
    })
};

document.getElementById('create_newChaneel').addEventListener('click', () => {
    createNewChaneel();
    displayChannelList();
});


//Update Channel
const channelUpdate = (id) => {
    const updateChannelName = document.getElementById('new-channel-name').value;
    const updateChannelDes = document.getElementById('nrew_channel_description').value;

    Request('/channel/' + currentChannelID, 'PUT', {
        "name": updateChannelName,
        "description": updateChannelDes
    })
    .then((data) => {
        document.getElementById('myList').innerHTML = "";
        displayChannelList();
        ChannelMeaasge(id);
        document.getElementById('channels').classList.remove('hide');
    })
    currentChannelID = id;
};

//get description and created time
const desAndtime = (id) => {
    const data = Request('/channel/' + currentChannelID, 'GET').then((data) => {  
        
    const channelDescription = document.createElement('p');
    channelDescription.innerHTML = "Description:" + data.description;

    const createdTime = document.createElement('p');
    var date = String(new Date(Date.parse(data.createdAt)));            
    createdTime.innerHTML = "Created at:" + date.substring(3,25);
            

    document.getElementById('channelDetails').appendChild(createdTime);
    document.getElementById('channelDetails').appendChild(channelDescription);                
    })
    currentChannelID = id;
}

const displayChannelList = () => {

    const data = Request('/channel', 'GET').then((data) => {
        for (const channel of data.channels) {
            const link = document.createElement('a');
            link.innerText = channel.name;
            link.setAttribute("class","list-group-item list-group-item-action");
            link.setAttribute("role","tab");
            link.setAttribute("data-bs-toggle","list");

            const channelName = document.createElement('h3');
            channelName.innerHTML = channel.name;

            const creator = document.createElement('p');
            creator.innerHTML = "Creator:" + channel.creator;

            const channelType = document.createElement('p');
            var type = channel.private;
            if (type === true) {
                channelType.innerHTML = "Channel Type: Private";
            }else {
                channelType.innerHTML = "Channel Type: Public";
            }
            
            document.getElementById('myList').appendChild(link);

            const currentUserId = Number(localStorage.getItem('currentUserId'));
            
            if (channel.members.includes(currentUserId)) { //is member
                link.addEventListener('click', () => {
                    ChannelMeaasge(channel.id);
                    desAndtime(channel.id);

                    // showChannelDetails
                    document.getElementById('channelDetails').classList.remove('hide');
                    document.getElementById('channelDetails').appendChild(channelName);
                    document.getElementById('channelDetails').appendChild(channelType);
                    document.getElementById('channelDetails').appendChild(creator);
                    document.getElementById('invite').classList.remove('hide');
                    

                    })

                    //Leave Channel
                    document.getElementById('leaveChannelButton').addEventListener('click', () => {
                        const data = Request('/channel/' + channel.id + '/leave', 'POST', {                                
                        }).then((data) => {
                            document.getElementById('channelDetails').classList.add('hide');
                            document.getElementById('channel_message').classList.add('hide');
                            document.getElementById('invite').classList.add('hide');
                            document.getElementById('channels').classList.remove('hide');

                        })
                    })

                    // Invite user to a channel
                    document.getElementById('inviteButton').addEventListener('click', () => {
                        const inviteUser = Number(document.getElementById('inviteInput').value);
                        const data = Request('/channel/' + channel.id + '/invite', 'POST', {  
                            "userId": inviteUser
                        })
                    })
            }else { //not member
                link.addEventListener('click', () => {
                    showEmptyChannel(channel.id);
                    desAndtime(channel.id);

                    //Join Channel
                    document.getElementById('joinButton').addEventListener('click', () => {
                        const data = Request('/channel/' + channel.id + '/join', 'POST', {                                
                        }).then((data) => {     
                            if (type === false) {  //is a Public Channel
                                ChannelMeaasge(channel.id);
                                desAndtime(channel.id);
                                document.getElementById('joinChannel').classList.add('hide');

                                // showChannelDetails
                                document.getElementById('updateButton').classList.remove('hide');
                                document.getElementById('channelDetails').classList.remove('hide');
                                document.getElementById('channelDetails').appendChild(channelName);
                                document.getElementById('channelDetails').appendChild(channelType);
                                document.getElementById('channelDetails').appendChild(creator);                                

                                document.getElementById('invite').classList.remove('hide');
                            }                                              
                        })                                                      
                    })
                }) 
            }                                                    
        }
    })
}

//get all the channel's messages
const ChannelMeaasge = (id) => {
    document.getElementById('channels').classList.add('hide');
    document.getElementById('joinChannel').classList.add('hide');
    document.getElementById('updateButton').classList.remove('hide');
    document.getElementById('channel_message').classList.remove('hide');
    
                
    Request('/message/' + id + '?start=0', 'GET').then((data) => {
        for (const msm of data.messages) {
            const sentTime = document.createElement('div');
            sentTime.setAttribute("id", "sentTimeDiv +", msm.id);
            var date = String(new Date(Date.parse(msm.sentAt)));            
            sentTime.innerText = date.substring(3,25);

            const theMessage = document.createElement('p');
            theMessage.setAttribute("id", msm.id);
            theMessage.innerText = msm.message;

            const groupButton = document.createElement('div');
            groupButton.setAttribute("class", "btn-group");
            groupButton.setAttribute("role", "group");
            groupButton.setAttribute("aria-label", "Basic outlined example");
            groupButton.setAttribute("style", "--bs-btn-padding-y: .20em; --bs-btn-padding-x: .3rem; --bs-btn-font-size: .75rem;");

            const deleteButton = document.createElement('button');
            deleteButton.setAttribute("class", "btn btn-outline-primary");
            deleteButton.setAttribute("style", "--bs-btn-padding-y: .20em; --bs-btn-padding-x: .3rem; --bs-btn-font-size: .75rem;");
            deleteButton.innerHTML = "Delete";

            const editButton = document.createElement('button');
            editButton.setAttribute("name", msm.id);
            editButton.setAttribute("class", "btn btn-outline-primary");
            editButton.setAttribute("style", "--bs-btn-padding-y: .20em; --bs-btn-padding-x: .3rem; --bs-btn-font-size: .75rem;");
            editButton.innerHTML = "Edit";

            groupButton.appendChild(editButton);
            groupButton.appendChild(deleteButton);

            const editTime = document.createElement('p');
            editTime.innerText = new Date(Date.parse(msm.editTime));
            
            sentTime.appendChild(theMessage);

            const sendImage = document.createElement('img');
            if (Boolean(msm.image) !== false) {
                sendImage.setAttribute("src", msm.image);
                sendImage.setAttribute("alt", "sendImage");
                sendImage.setAttribute("id", msm.image);
                sentTime.appendChild(sendImage);
            }
            
            //react            
            const react_like = document.createElement('p');
            react_like.setAttribute("class", "react badge text-bg-light");
            react_like.setAttribute("id", "like +", msm.id);
            react_like.innerHTML = "\uD83E\uDD70";
            
            const react_doubt = document.createElement('p');
            react_doubt.setAttribute("class", "react badge text-bg-light");
            react_doubt.setAttribute("id", "doubt +", msm.id);
            react_doubt.innerHTML = "\uD83E\uDD14";
            
            
            const react_dislike = document.createElement('p');
            react_dislike.setAttribute("class", "react badge text-bg-light");
            react_dislike.setAttribute("id", "dislike +", msm.id);
            react_dislike.innerHTML = "\uD83D\uDE41";
            
            sentTime.appendChild(react_dislike);
            sentTime.appendChild(react_doubt);
            sentTime.appendChild(react_like);
               
            
            react_like.addEventListener('click', () => {
                // if (allReacts.includes("like") || allReactUser.includes(currentUserId)) {
                    Request('/message/unreact/' + currentChannelID + '/' + msm.id, 'POST', {                    
                        "react": "like",
                        "user": currentUserId
                    }).then((data) => {
                        document.getElementById("like +", msm.id).setAttribute("class", "react badge text-bg-light");
                    })
                // }
                // else {
                    Request('/message/react/' + currentChannelID + '/' + msm.id, 'POST', {
                        "react": "like",
                        "user": currentUserId
                    }).then((data) => {
                        document.getElementById("like +", msm.id).setAttribute("class", "react badge text-bg-warning");
                    })
                // }
                
            })

            
            react_doubt.addEventListener('click', () => {
                Request('/message/react/' + currentChannelID + '/' + msm.id, 'POST', {
                    "react": "doubt",
                    "user": currentUserId
                }).then((data) => {
                    document.getElementById("doubt +", msm.id).setAttribute("class", "react badge text-bg-warning");
                }) 
            })
            
            react_dislike.addEventListener('click', () => {
                Request('/message/react/' + currentChannelID + '/' + msm.id, 'POST', {
                    "react": "dislike",
                    "user": currentUserId
                }).then((data) => {
                    document.getElementById("dislike +", msm.id).setAttribute("class", "react badge text-bg-warning");
                })
            }) 
            
            
                     
            



            const currentUserId = Number(localStorage.getItem('currentUserId'));
            if (currentUserId === msm.sender) {
                sentTime.appendChild(groupButton);

                editButton.addEventListener('click', () => {
                    console.log(theMessage.getAttribute('id'))
                    console.log(editButton.getAttribute('name'))
                    if (theMessage.getAttribute('id') === editButton.getAttribute('name')) {
                        document.getElementById(msm.id).setAttribute("contenteditable", "true");

                        //Edited Message
                        const editDone = document.createElement('button');
                        editDone.setAttribute("class", "btn btn-warning");
                        editDone.setAttribute("style", "--bs-btn-padding-y: .20em; --bs-btn-padding-x: .3rem; --bs-btn-font-size: .75rem;");
                        editDone.innerHTML = "Save";
                        sentTime.appendChild(editDone); 

                        editDone.addEventListener('click', () => {
                            const updateMessage = document.getElementById(msm.id).value;
                            const updateImage = document.getElementById(msm.image).value;
                            if (Boolean(updateImage) !== false || Boolean(updateMessage) !== false) {
                                Request('/message/' + currentChannelID + '/' + msm.id, 'PUT', {
                                    "message": updateMessage,
                                    "image": updateImage
                                })
                                .then((data) => {
                                    document.getElementById('channels').classList.remove('hide');
                                })

                            }else if (updateMessage === msm.message && updateImage === msm.image) {
                                editDone.setAttribute("class","disabled");
                            }
                        })                       
                    }                    
                })
                //Delete Message
                deleteButton.addEventListener('click',() => {    
                    Request('/message/' + currentChannelID + '/' + msm.id, 'DELETE', {  
                    }).then((data) => {
                        document.getElementById("sentTimeDiv +", msm.id).remove();
                    })
                })
            }

            //See User profiles
            Request('/user/' + msm.sender, 'GET').then((data) => {
                document.getElementById('logged_in').innerHTML = "Welcome " + data.name + "!";

                const senderName = document.createElement('p');
                senderName.setAttribute("id", "senderNameId");
                senderName.setAttribute("class", "badge rounded-pill text-bg-info");
                senderName.innerHTML = data.name;
                
                const senderEmail = document.createElement('p');
                senderEmail.innerHTML = data.email;
                
                const senderBio = document.createElement('p');
                senderBio.innerHTML = data.bio;
                
                const senderImg = document.createElement('img');
                if (Boolean(data.image) !== false) {
                    senderImg.setAttribute("src", data.image);
                    senderImg.setAttribute("alt", "senderImage");
                }else {
                    senderImg.setAttribute("src", "./frontend/src/default.png");
                }
                
                
                sentTime.appendChild(senderName);
                sentTime.appendChild(senderImg);
                sentTime.appendChild(document.createElement('hr'));
                document.getElementById('message_part').appendChild(sentTime);
                
                senderName.addEventListener('click', () => {
                    senderName.setAttribute("data-bs-target","#offcanvasRight");
                    senderName.setAttribute("data-bs-toggle","offcanvas");
                    senderName.setAttribute("aria-controls","offcanvasRight");

                    document.getElementById('offcanvasRightLabel').innerHTML = "";
                    document.getElementById('offcanvasRightLabel').innerHTML = data.name + "<hr>";

                    document.getElementById('offcanvasBody').innerHTML = "";
                    if (Boolean(data.bio) !== false) {
                        document.getElementById('offcanvasBody').innerHTML = "Email:" + data.email + "<br>" + "Personal Bio:" + data.bio;
                    }else {
                        document.getElementById('offcanvasBody').innerHTML = "Email:" + data.email + "<br>" + "Personal Bio: Nothing Here :)"; 
                    }

                })
            })
        }
      
    })


                        
                    

        

            
        
    currentChannelID = id;
}

//Send Meassge
document.getElementById('message_send').addEventListener('click', () => {
    const new_message = document.getElementById('message_text').value;
    if (new_message !== "") {
        const data = Request('/message/' + currentChannelID, 'POST', {
            "message": new_message 
        })
        .then((data) => {
            showNewChannelMeaasge(currentChannelID);
            
        })
    }else {
        alert("Please input your message.");
    }    
});

const showNewChannelMeaasge = (id) => {
    document.getElementById('channels').classList.add('hide');
    document.getElementById('joinChannel').classList.add('hide');
    document.getElementById('updateButton').classList.remove('hide');
    document.getElementById('channel_message').classList.remove('hide');
    document.getElementById('message_part').innerHTML = "";

    ChannelMeaasge(currentChannelID)
    currentChannelID = id;
}









document.getElementById('a_register').addEventListener('click', () => {
    document.getElementById('Register').classList.remove('hide');
    document.getElementById('Login').classList.add('hide');
}); 

const logout = () => {
    document.getElementById('logged_in').classList.add('hide');
    document.getElementById('logout').classList.remove('hide');
    token = null;
    userID = null;
};



let radioCheck = () => {
    var item = document.getElementsByName('channelCheck');
    for (var i=0; i<item.length; i++) {
        if (item[i].checked) {
            radioValue = true
        }else {
            radioValue = false
        }
    }
};

// document.getElementById('updateButton').addEventListener('click', () => {
//     let buttonEdit1 = document.getElementById('ModalHead');
//     const data = Request('/channel', 'GET').then((data) => {
//         for (const channel of data.channels) {
//             buttonEdit1.innerHTML = channel.name;
//         }
//     })

//     let buttonEdit2 = document.getElementById('modal_label');
//     buttonEdit2.innerHTML = "New Channel Name:";

//     let buttonEdit3 = document.getElementById('update-submit');
//     buttonEdit3.innerHTML = "Update";

//     // let buttonEdit4 = document.getElementById('radio-form');
//     // let radio1 = document.getElementById('radio1');
//     // let radio2 = document.getElementById('radio2');
//     // if (radio1 !== null || radio2 !== null) {
//     //     buttonEdit4.removeChild(radio1);
//     //     buttonEdit4.removeChild(radio2);
//     // }
    
//     document.getElementById('update-submit').onclick = () => channelUpdate(currentChannelID); 
    
// })

//显示模态框
document.getElementById('updateButton').addEventListener('click', () => {
    modalOpen();
    modalClose();
    
})
document.getElementById('edit-submit').onclick = () => channelUpdate(currentChannelID); 



function modalOpen() {
    let modal = document.getElementsByClassName("modal-box")[0];
    let documentWidth = window.innerWidth;
    let documentHeight = window.innerHeight;
    let modalWidth = modal.offsetWidth;
    modal.style.left = ((documentWidth - modalWidth) / 2.0).toString();
    modal.style.visibility = "visible";
}

function modalClose() {
    let modal = document.getElementsByClassName("modal-box")[0];
    modal.style.visibility = "hidden";
}