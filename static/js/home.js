playersNb = document.getElementById("amountplayers");
form = document.querySelector(".form");


names = [];

form.addEventListener("submit", (e) => {
    setNames(e);
});

playersNb.addEventListener("input", () => {
  adaptNames(playersNb.value);
});

function setNames(e){
    e.preventDefault();
    for(let i = 0; i < playersNb.value; i++){
        if(!names.includes(document.getElementById("name"+i).value)){
            names.push(document.getElementById("name"+i).value);
            localStorage.setItem("name"+i, document.getElementById("name"+i).value);
        }
    }
        window.location.href = "game.html";
}


function adaptNames(value){
    container = document.getElementById("players-names");
    
    for(let i = 0; i < value; i++){
        if(!document.getElementById("name"+i)){
            label = document.createElement("label");
            label.textContent = " Player " + (i + 1);
            
            input = document.createElement("input");
            input.type = "text";
            input.id = "name" + i;
            input.required = true;
            input.placeholder = "Enter a crazy name";
            
            br = document.createElement("br");
            
            container.appendChild(label);
            container.appendChild(input);
            container.appendChild(br);
        }
    }
    
    // Remove fields beyond the new player count
    let i = value;
    while(document.getElementById("name"+i)){
        input = document.getElementById("name"+i);
        label = input.previousElementSibling;
        br = input.nextElementSibling;
        
        if(label && label.tagName === 'LABEL') label.remove();
        input.remove();
        if(br && br.tagName === 'BR') br.remove();
        
        i++;
    }
}


function decreasePlayer(){
    if(playersNb.value > 0){
        playersNb.value--;
        adaptNames(playersNb.value);
    }
}

function increasePlayer(){
    if(playersNb.value < 10){
        playersNb.value++;
        adaptNames(playersNb.value);
    }
}