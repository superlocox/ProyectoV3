


const socket = io();


socket.on('message', message=>{
    console.log(message);
})

module.exports = router;