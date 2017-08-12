module.exports = function chat(io) {
    let connected = 0;
    let userNames = []; // Don't allow same username

    io.on('connection',(socket)=>{
        console.log(`chat - user connected`);
        connected++;
        io.emit('new message', {type:'user-connected', message: 'connected', connectedUsers: connected});

        socket.on('disconnect', function(){
            connected--;
            io.emit('new message', {type:'user-disconnected', message: 'disconnected', connectedUsers: connected});
            console.log('user disconnected');
        });

        socket.on('add-message', (message) => {
            io.emit('new message', {type:'new-message', text: message.text, user: message.user});
        });
    });
};