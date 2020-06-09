import express from "express";
import morgan from "morgan";
import relay from "./mqtt/server_mqtt";
// For types
import { AddressInfo } from "net";


const PORT = 3011;

const app = express();


app.use(morgan('dev'));


app.get("/", (req: express.Request, res: express.Response)=> {
    res.send("Index worked.");
})

var palletizer_state = {
    status : "N/A",
    cycle: 0, 
    current_box: 0,
    total_box: 0,
    time: 2,
    errors: [] as any[]
};


app.get("/events", (req: express.Request, res: express.Response)=>{
    
    let write = (data: any) => {
        res.write("event: message\n");
        res.write("data: "+ JSON.stringify(data));
        res.write("\n\n");
    }

    let handle_state = (message: any) => {
        // PArge the message properly
        console.log("We will need a type here", message);
        // palletizer_state = message;
        // let data = {state : palletizer_state};
        write(palletizer_state);
    };

    let handle_error = (message: any)=>{
        palletizer_state.errors.push(message);
        write(palletizer_state);
    }

    var client = relay(handle_error, handle_state);

    req.on('close', ()=>{
        // End MQTT client and response.
        client.end();
        res.end();
    });
    
    res.writeHead(200,{
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin' : "*",
        'Access-Control-Allow-Headers' : "Origin, X-Requested-With, Content-Type, Accept"
    });
   
    res.flushHeaders();

    res.write('retry: 10000\n\n'); // Retry every 10s if connection is lost.


    // Write the initial data.
    write(palletizer_state);
});


let server = app.listen(PORT, "localhost",()=>{

    let address = server.address() as AddressInfo;
    let address_string = "http://"+address.address+":"+address.port;
    
    console.log(`Server running at ${address_string}.`);
});
