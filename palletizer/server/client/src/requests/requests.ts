import axios, { AxiosResponse } from "axios";
import {ConfigState} from "../types/Types";

function get_configs(callback: any){
    let url = "/configs";
    axios.get(url).then((res: AxiosResponse)=>{
        let data = res.data as ConfigState; 
        callback(data); 
    });
}

async function get_config(filename : string) {
    let res = await axios.get("/config/" + filename);
    return res.data;
}


function post_config(filename: string, content: any, callback: any) {
    let url = "/config/new";

    let data = {
        filename: filename,
        data: content,
    };
    
    axios.post(url, data).then((res : AxiosResponse)=>{
        console.log(res);
        callback();
    });
}



export {get_configs, get_config};

export {post_config};