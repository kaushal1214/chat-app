const socket = io()

// Elements
const $messageForm = document.querySelector('#formMessage')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageGeolocation = document.querySelector('#send-location')
const $message = document.querySelector('#messages')

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Parsing the QueryString
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoScroll = ()=>{
    
    // New message added details
    const $newMessage = $message.lastElementChild

    // New message 
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // Container Height
    const containerHeight = $message.scrollHeight

    // How far are we?
    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = containerHeight
    }

}

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{room,users})

    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage',(url)=>{
    const html = Mustache.render(locationTemplate,{
                                    username: url.username,
                                    url:url.text, 
                                    createdAt: moment(url.createdAt).format('LT')})
    $message.insertAdjacentHTML('beforeend',html)
    autoScroll()
})


socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
                        username: message.username,
                        message: message.text, 
                        createdAt: moment(message.createdAt).format('LT')})
    $message.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    // Disable the form
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=>{
        // Enable Form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            console.log(error)
        }
        console.log('Delivered!')
    })
})

$messageGeolocation.addEventListener('click',()=>{
    if(!navigator.geolocation)
        return alert('Geolocation not available!')
    const latitude = 30.2345
    const longitude = 75.3456

    // Disable button
    $messageGeolocation.setAttribute('disabled','disabled')

    socket.emit('send-location',{latitude,longitude},()=>{
        $messageGeolocation.removeAttribute('disabled')
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error) {
        alert(error)
        location.href= '/'
    }
    
    
})